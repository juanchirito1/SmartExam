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
  constructor(
    private readonly prisma: PrismaService,
    private readonly resultadosService: ResultadosService,
    private readonly configService: ConfigService,
  ) {}

  async procesar(
    simulacroId: number,
    archivo: Express.Multer.File,
  ) {
    // =====================================================
    // 1. VALIDAR ARCHIVO
    // =====================================================

    if (!archivo) {
      throw new BadRequestException(
        'Debe enviar una imagen de la ficha',
      );
    }

    if (!archivo.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo enviado debe ser una imagen',
      );
    }

    // =====================================================
    // 2. VALIDAR SIMULACRO
    // =====================================================

    const simulacro =
      await this.prisma.simulacro.findUnique({
        where: {
          id: simulacroId,
        },
      });

    if (!simulacro) {
      throw new NotFoundException(
        'El simulacro indicado no existe',
      );
    }

    // =====================================================
    // 3. ENVIAR IMAGEN AL SERVICIO OMR
    // =====================================================

    const omrUrl =
      this.configService.get<string>(
        'OMR_SERVICE_URL',
      );

    if (!omrUrl) {
      throw new ServiceUnavailableException(
        'El servicio OMR no está configurado',
      );
    }

    const formData = new FormData();

    const bytes = Uint8Array.from(
        archivo.buffer,
    );

    const blob = new Blob(
     [bytes],
     {
        type: archivo.mimetype,
     },
    );

    formData.append(
        'archivo',
        blob,
        archivo.originalname,
    );

    let respuestaOmr: Response;

    try {
      respuestaOmr = await fetch(
        `${omrUrl}/omr/procesar`,
        {
          method: 'POST',
          body: formData,
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo conectar con el servicio OMR',
      );
    }

    if (!respuestaOmr.ok) {
      const texto =
        await respuestaOmr.text();

      throw new BadRequestException(
        `El servicio OMR no pudo procesar la ficha: ${texto}`,
      );
    }

    const omr =
      (await respuestaOmr.json()) as OmrResultado;

    // =====================================================
    // 4. VALIDAR LECTURA DEL DOCUMENTO
    // =====================================================

    if (!omr.documentoDetectado) {
      throw new BadRequestException(
        'No se pudo detectar correctamente la hoja',
      );
    }

    if (!omr.dniValido || !omr.dni) {
      throw new BadRequestException({
        mensaje:
          'No se pudo leer correctamente el DNI',

        errores:
          omr.erroresDni,
      });
    }

    if (
      omr.respuestas.length !==
      simulacro.totalPreguntas
    ) {
      throw new BadRequestException(
        `Se esperaban ${simulacro.totalPreguntas} respuestas y el OMR devolvió ${omr.respuestas.length}`,
      );
    }

    // =====================================================
    // 5. BUSCAR ALUMNO POR DNI
    // =====================================================

    const alumno =
      await this.prisma.alumno.findUnique({
        where: {
          dni: omr.dni,
        },
      });

    if (!alumno) {
      throw new NotFoundException(
        `No existe un alumno registrado con DNI ${omr.dni}`,
      );
    }

    // =====================================================
    // 6. BUSCAR INSCRIPCIÓN EN ESTE SIMULACRO
    // =====================================================

    const inscripcion =
      await this.prisma.inscripcion.findUnique({
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
        'El alumno no se encuentra inscrito en este simulacro',
      );
    }

    if (!inscripcion.estado) {
      throw new BadRequestException(
        'La inscripción se encuentra inactiva',
      );
    }

    // =====================================================
    // 7. CONVERTIR SALIDA OMR AL FORMATO DE RESULTADOS
    // =====================================================

    const respuestas =
      omr.respuestas.map(
        (respuesta) => ({
          numero:
            respuesta.numero,

          marcas:
            respuesta.marcas,
        }),
      );

    // =====================================================
    // 8. CALIFICAR
    // =====================================================

    const resultado =
      await this.resultadosService.calificar({
        inscripcionId:
          inscripcion.id,

        respuestas,
      });

    // =====================================================
    // 9. RESPUESTA FINAL
    // =====================================================

    return {
      mensaje:
        'Ficha procesada y calificada correctamente',

      lecturaOmr: {
        dni:
          omr.dni,

        totalRespuestas:
          omr.resumen.total,

        unicas:
          omr.resumen.unicas,

        blancas:
          omr.resumen.blancas,

        dobles:
          omr.resumen.dobles,
      },

      alumno: {
        id:
          alumno.id,

        dni:
          alumno.dni,

        nombre:
          `${alumno.nombres} ${alumno.apellidos}`,
      },

      inscripcion: {
        id:
          inscripcion.id,

        carrera:
          inscripcion.carrera.nombre,

        grupo:
          inscripcion.grupo.codigo,
      },

      resultado,
    };
  }
}