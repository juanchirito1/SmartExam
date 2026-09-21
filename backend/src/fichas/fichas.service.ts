import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';

import { ResultadosService } from '../resultados/resultados.service.js';

interface OmrRespuesta {
  numero: number;
  marcas: string[];
  tipo: string;
}

interface OmrResultado {
  documentoDetectado: boolean;

  dni: string | null;
  dniValido: boolean;

  erroresDni: string[];

  respuestas: OmrRespuesta[];

  resumen: {
    total: number;
    unicas: number;
    blancas: number;
    dobles: number;
  };
}

@Injectable()
export class FichasService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  private readonly OMR_TIMEOUT_MS = 30_000;

  constructor(
    private readonly prisma: PrismaService,

    private readonly resultadosService: ResultadosService,

    private readonly configService: ConfigService,
  ) {}

  // =========================================================
  // DETECTAR TIPO REAL DEL ARCHIVO
  // =========================================================

  private detectarTipoImagen(
    buffer: Buffer,
  ): 'image/jpeg' | 'image/png' | null {
    /*
      JPEG:
      FF D8 FF
    */

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return 'image/jpeg';
    }

    /*
      PNG:
      89 50 4E 47 0D 0A 1A 0A
    */

    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return 'image/png';
    }

    return null;
  }

  // =========================================================
  // VALIDAR ARCHIVO
  // =========================================================

  private validarArchivo(archivo: Express.Multer.File) {
    if (!archivo) {
      throw new BadRequestException('Debe enviar una imagen de la ficha.');
    }

    if (!archivo.buffer || archivo.buffer.length === 0) {
      throw new BadRequestException('La imagen enviada se encuentra vacía.');
    }

    if (archivo.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('La imagen no puede superar los 10 MB.');
    }

    const tiposPermitidos = ['image/jpeg', 'image/png'];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPG, JPEG o PNG.',
      );
    }

    /*
      No confiamos únicamente en mimetype.

      Revisamos los primeros bytes del
      archivo para comprobar que realmente
      sea JPEG o PNG.
    */

    const tipoReal = this.detectarTipoImagen(archivo.buffer);

    if (!tipoReal) {
      throw new BadRequestException(
        'El contenido del archivo no corresponde a una imagen JPG o PNG válida.',
      );
    }

    /*
      Evita, por ejemplo:

      archivo.exe renombrado como foto.jpg
      o
      PNG enviado declarando image/jpeg.
    */

    if (tipoReal !== archivo.mimetype) {
      throw new BadRequestException(
        'El tipo real de la imagen no coincide con el tipo declarado.',
      );
    }

    return tipoReal;
  }

  // =========================================================
  // VALIDAR RESPUESTA DEL SERVICIO OMR
  // =========================================================

  private validarRespuestaOmr(valor: unknown): asserts valor is OmrResultado {
    if (!valor || typeof valor !== 'object') {
      throw new ServiceUnavailableException(
        'El servicio OMR devolvió una respuesta inválida.',
      );
    }

    const omr = valor as Partial<OmrResultado>;

    if (
      typeof omr.documentoDetectado !== 'boolean' ||
      typeof omr.dniValido !== 'boolean' ||
      !Array.isArray(omr.erroresDni) ||
      !Array.isArray(omr.respuestas) ||
      !omr.resumen ||
      typeof omr.resumen !== 'object'
    ) {
      throw new ServiceUnavailableException(
        'El servicio OMR devolvió una estructura inesperada.',
      );
    }

    for (const respuesta of omr.respuestas) {
      if (
        !respuesta ||
        typeof respuesta.numero !== 'number' ||
        !Number.isInteger(respuesta.numero) ||
        !Array.isArray(respuesta.marcas) ||
        typeof respuesta.tipo !== 'string'
      ) {
        throw new ServiceUnavailableException(
          'El servicio OMR devolvió respuestas inválidas.',
        );
      }

      const marcasValidas = respuesta.marcas.every(
        (marca) =>
          typeof marca === 'string' &&
          ['A', 'B', 'C', 'D', 'E'].includes(marca.trim().toUpperCase()),
      );

      if (!marcasValidas) {
        throw new ServiceUnavailableException(
          'El servicio OMR devolvió alternativas no válidas.',
        );
      }
    }

    if (
      typeof omr.resumen.total !== 'number' ||
      typeof omr.resumen.unicas !== 'number' ||
      typeof omr.resumen.blancas !== 'number' ||
      typeof omr.resumen.dobles !== 'number'
    ) {
      throw new ServiceUnavailableException(
        'El resumen generado por el servicio OMR no es válido.',
      );
    }
  }

  // =========================================================
  // PROCESAR FICHA
  // =========================================================

  async procesar(simulacroId: number, archivo: Express.Multer.File) {
    // =====================================================
    // 1. VALIDAR ARCHIVO
    // =====================================================

    const tipoReal = this.validarArchivo(archivo);

    // =====================================================
    // 2. VALIDAR SIMULACRO
    // =====================================================

    const simulacro = await this.prisma.simulacro.findUnique({
      where: {
        id: simulacroId,
      },
    });

    if (!simulacro) {
      throw new NotFoundException('El simulacro indicado no existe.');
    }

    /*
      No queremos procesar fichas
      pertenecientes a simulacros borradores.
    */

    if (simulacro.estado === 'BORRADOR') {
      throw new BadRequestException(
        'No se pueden procesar fichas de un simulacro en borrador.',
      );
    }

    // =====================================================
    // 3. CONFIGURACIÓN OMR
    // =====================================================

    const omrUrl = this.configService.get<string>('OMR_SERVICE_URL');

    if (!omrUrl) {
      throw new ServiceUnavailableException(
        'El servicio OMR no se encuentra configurado.',
      );
    }

    const urlBase = omrUrl.replace(/\/+$/, '');

    // =====================================================
    // 4. PREPARAR IMAGEN
    // =====================================================

    const formData = new FormData();

    /*
      Usamos Uint8Array para mantener
      compatibilidad con Blob en Node.
    */

    const bytes = Uint8Array.from(archivo.buffer);

    const blob = new Blob([bytes], {
      type: tipoReal,
    });

    formData.append('archivo', blob, archivo.originalname);

    // =====================================================
    // 5. TIMEOUT
    // =====================================================

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, this.OMR_TIMEOUT_MS);

    let respuestaOmr: Response;

    try {
      respuestaOmr = await fetch(`${urlBase}/omr/procesar`, {
        method: 'POST',

        body: formData,

        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException(
          'El servicio OMR tardó demasiado en responder.',
        );
      }

      console.error('Error conectando con OMR:', error);

      throw new ServiceUnavailableException(
        'No se pudo conectar con el servicio OMR.',
      );
    } finally {
      clearTimeout(timeout);
    }

    // =====================================================
    // 6. VALIDAR ESTADO HTTP OMR
    // =====================================================

    if (!respuestaOmr.ok) {
      /*
        Registramos el detalle técnico
        solamente en backend.

        No lo enviamos directamente al usuario.
      */

      let detalle = 'Sin detalle';

      try {
        detalle = (await respuestaOmr.text()).slice(0, 1000);
      } catch {
        // Ignoramos error adicional
        // al leer la respuesta.
      }

      console.error(`OMR respondió ${respuestaOmr.status}: ${detalle}`);

      /*
        4xx:
        La imagen llegó al OMR,
        pero no pudo ser procesada.
      */

      if (respuestaOmr.status >= 400 && respuestaOmr.status < 500) {
        throw new BadRequestException(
          'La ficha no pudo ser interpretada por el servicio OMR. Verifica que la imagen sea clara y corresponda al formato oficial.',
        );
      }

      /*
        5xx:
        Fallo del servicio Python.
      */

      throw new ServiceUnavailableException(
        'El servicio de procesamiento OMR no está disponible temporalmente.',
      );
    }

    // =====================================================
    // 7. LEER JSON
    // =====================================================

    let respuestaJson: unknown;

    try {
      respuestaJson = await respuestaOmr.json();
    } catch {
      throw new ServiceUnavailableException(
        'El servicio OMR devolvió una respuesta que no pudo ser interpretada.',
      );
    }

    this.validarRespuestaOmr(respuestaJson);

    const omr = respuestaJson;

    // =====================================================
    // 8. VALIDAR LECTURA DEL DOCUMENTO
    // =====================================================

    if (!omr.documentoDetectado) {
      throw new BadRequestException(
        'No se pudo detectar correctamente la hoja. Verifica que la ficha completa sea visible.',
      );
    }

    if (!omr.dniValido || !omr.dni) {
      throw new BadRequestException({
        mensaje: 'No se pudo leer correctamente el DNI.',

        errores: omr.erroresDni,
      });
    }

    /*
      DNI esperado por SmartExam:
      exactamente 8 dígitos.
    */

    if (!/^\d{8}$/.test(omr.dni)) {
      throw new BadRequestException(
        'El DNI detectado por la ficha no tiene un formato válido.',
      );
    }

    if (omr.respuestas.length !== simulacro.totalPreguntas) {
      throw new BadRequestException(
        `Se esperaban ${simulacro.totalPreguntas} respuestas y el OMR devolvió ${omr.respuestas.length}.`,
      );
    }

    // =====================================================
    // 9. VALIDAR NUMERACIÓN DE RESPUESTAS
    // =====================================================

    const numeros = omr.respuestas.map((respuesta) => respuesta.numero);

    const numerosUnicos = new Set(numeros);

    if (numerosUnicos.size !== simulacro.totalPreguntas) {
      throw new BadRequestException(
        'El servicio OMR devolvió preguntas duplicadas.',
      );
    }

    for (let numero = 1; numero <= simulacro.totalPreguntas; numero++) {
      if (!numerosUnicos.has(numero)) {
        throw new BadRequestException(
          `La lectura OMR no contiene la pregunta ${numero}.`,
        );
      }
    }

    // =====================================================
    // 10. VALIDAR RESUMEN
    // =====================================================

    if (omr.resumen.total !== simulacro.totalPreguntas) {
      throw new BadRequestException(
        'El resumen del OMR no coincide con el número de preguntas del simulacro.',
      );
    }

    const sumaResumen =
      omr.resumen.unicas + omr.resumen.blancas + omr.resumen.dobles;

    if (sumaResumen !== omr.resumen.total) {
      throw new BadRequestException(
        'El resumen generado por el OMR es inconsistente.',
      );
    }

    // =====================================================
    // 11. BUSCAR ALUMNO
    // =====================================================

    const alumno = await this.prisma.alumno.findUnique({
      where: {
        dni: omr.dni,
      },
    });

    if (!alumno) {
      throw new NotFoundException(
        `No existe un alumno registrado con DNI ${omr.dni}.`,
      );
    }

    if (!alumno.estado) {
      throw new BadRequestException(
        'El alumno identificado se encuentra inactivo.',
      );
    }

    // =====================================================
    // 12. BUSCAR INSCRIPCIÓN
    // =====================================================

    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        alumnoId_simulacroId: {
          alumnoId: alumno.id,

          simulacroId,
        },
      },

      include: {
        carrera: true,

        grupo: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        'El alumno no se encuentra inscrito en este simulacro.',
      );
    }

    if (!inscripcion.estado) {
      throw new BadRequestException('La inscripción se encuentra inactiva.');
    }

    // =====================================================
    // 13. CONVERTIR RESPUESTAS
    // =====================================================

    const respuestas = omr.respuestas
      .map((respuesta) => ({
        numero: respuesta.numero,

        marcas: respuesta.marcas.map((marca) => marca.trim().toUpperCase()),
      }))
      .sort((a, b) => a.numero - b.numero);

    // =====================================================
    // 14. CALIFICAR
    // =====================================================

    const resultado = await this.resultadosService.calificar({
      inscripcionId: inscripcion.id,

      respuestas,
    });

    // =====================================================
    // 15. RESPUESTA FINAL
    // =====================================================

    return {
      mensaje: 'Ficha procesada y calificada correctamente.',

      lecturaOmr: {
        dni: omr.dni,

        totalRespuestas: omr.resumen.total,

        unicas: omr.resumen.unicas,

        blancas: omr.resumen.blancas,

        dobles: omr.resumen.dobles,
      },

      alumno: {
        id: alumno.id,

        dni: alumno.dni,

        nombre: `${alumno.nombres} ${alumno.apellidos}`,
      },

      inscripcion: {
        id: inscripcion.id,

        carrera: inscripcion.carrera.nombre,

        grupo: inscripcion.grupo.codigo,
      },

      resultado,
    };
  }
}
