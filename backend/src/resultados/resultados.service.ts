import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CalificarExamenDto } from './dto/calificar-examen.dto.js';

@Injectable()
export class ResultadosService {
  constructor(private readonly prisma: PrismaService) {}

  private validarMarcas(marcas: string[]) {
    const permitidas = ['A', 'B', 'C', 'D', 'E'];

    const normalizadas = marcas.map((marca) => marca.trim().toUpperCase());

    for (const marca of normalizadas) {
      if (!permitidas.includes(marca)) {
        throw new BadRequestException(
          `Alternativa inválida: ${marca}. Solo se permite A, B, C, D o E`,
        );
      }
    }

    const unicas = [...new Set(normalizadas)];

    return unicas;
  }

  private redondear(valor: number) {
    return Math.round(valor * 100) / 100;
  }

  async calificar(dto: CalificarExamenDto) {
    // =====================================================
    // 1. INSCRIPCIÓN
    // =====================================================

    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        id: dto.inscripcionId,
      },

      include: {
        alumno: true,
        carrera: true,
        grupo: true,
        simulacro: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('La inscripción indicada no existe');
    }

    if (!inscripcion.estado) {
      throw new BadRequestException('La inscripción se encuentra inactiva');
    }

    // =====================================================
    // 2. CLAVE DEL SIMULACRO
    // =====================================================

    const preguntas = await this.prisma.pregunta.findMany({
      where: {
        simulacroId: inscripcion.simulacroId,
      },

      include: {
        area: true,
      },

      orderBy: {
        numero: 'asc',
      },
    });

    if (preguntas.length !== inscripcion.simulacro.totalPreguntas) {
      throw new BadRequestException(
        `La clave del simulacro está incompleta. Se esperaban ${inscripcion.simulacro.totalPreguntas} preguntas y existen ${preguntas.length}`,
      );
    }

    // =====================================================
    // 3. RESPUESTAS DEL ALUMNO
    // =====================================================

    if (dto.respuestas.length !== inscripcion.simulacro.totalPreguntas) {
      throw new BadRequestException(
        `Deben recibirse exactamente ${inscripcion.simulacro.totalPreguntas} respuestas`,
      );
    }

    const numerosRecibidos = dto.respuestas.map(
      (respuesta) => respuesta.numero,
    );

    const numerosUnicos = new Set(numerosRecibidos);

    if (numerosUnicos.size !== inscripcion.simulacro.totalPreguntas) {
      throw new BadRequestException('Existen números de pregunta duplicados');
    }

    for (
      let numero = 1;
      numero <= inscripcion.simulacro.totalPreguntas;
      numero++
    ) {
      if (!numerosUnicos.has(numero)) {
        throw new BadRequestException(
          `Falta la respuesta de la pregunta ${numero}`,
        );
      }
    }

    // =====================================================
    // 4. REGLAS DE PUNTAJE DEL GRUPO
    // =====================================================

    const reglas = await this.prisma.reglaPuntaje.findMany({
      where: {
        grupoId: inscripcion.grupoId,
      },
    });

    if (reglas.length === 0) {
      throw new BadRequestException(
        `No existen reglas de puntaje configuradas para el grupo ${inscripcion.grupo.codigo}`,
      );
    }

    const reglasPorArea = new Map(reglas.map((regla) => [regla.areaId, regla]));

    // =====================================================
    // 5. CALIFICACIÓN
    // =====================================================

    const respuestaPorNumero = new Map(
      dto.respuestas.map((respuesta) => [respuesta.numero, respuesta]),
    );

    let puntajeTotal = 0;
    let puntajeMaximo = 0;

    let correctas = 0;
    let incorrectas = 0;
    let blancas = 0;
    let dobles = 0;

    const detalles: {
      preguntaId: number;
      respuestaMarcada: string | null;
      tipo: string;
      puntajeObtenido: number;
    }[] = [];

    for (const pregunta of preguntas) {
      const regla = reglasPorArea.get(pregunta.areaId);

      if (!regla) {
        throw new BadRequestException(
          `No existe regla de puntaje para el área ${pregunta.area.nombre} en el grupo ${inscripcion.grupo.codigo}`,
        );
      }

      puntajeMaximo += regla.puntajeCorrecta;

      const respuesta = respuestaPorNumero.get(pregunta.numero);

      if (!respuesta) {
        throw new BadRequestException(`Falta la respuesta ${pregunta.numero}`);
      }

      const marcas = this.validarMarcas(respuesta.marcas);

      let tipo: string;
      let puntajeObtenido: number;
      let respuestaMarcada: string | null;

      // BLANCO
      if (marcas.length === 0) {
        tipo = 'BLANCO';

        puntajeObtenido = regla.puntajeBlanco;

        respuestaMarcada = null;

        blancas++;
      }

      // DOBLE / MÚLTIPLE
      else if (marcas.length > 1) {
        tipo = 'DOBLE';

        puntajeObtenido = regla.puntajeIncorrecta;

        respuestaMarcada = marcas.join(',');

        dobles++;
      }

      // UNA SOLA MARCA
      else {
        respuestaMarcada = marcas[0];

        if (respuestaMarcada === pregunta.respuestaCorrecta) {
          tipo = 'CORRECTA';

          puntajeObtenido = regla.puntajeCorrecta;

          correctas++;
        } else {
          tipo = 'INCORRECTA';

          puntajeObtenido = regla.puntajeIncorrecta;

          incorrectas++;
        }
      }

      puntajeTotal += puntajeObtenido;

      detalles.push({
        preguntaId: pregunta.id,

        respuestaMarcada,

        tipo,

        puntajeObtenido: this.redondear(puntajeObtenido),
      });
    }

    puntajeTotal = this.redondear(puntajeTotal);

    puntajeMaximo = this.redondear(puntajeMaximo);

    // =====================================================
    // 6. GUARDAR RESULTADO
    // =====================================================

    const resultado = await this.prisma.$transaction(async (tx) => {
      const resultadoGuardado = await tx.resultado.upsert({
        where: {
          inscripcionId: inscripcion.id,
        },

        update: {
          puntajeTotal,
          correctas,
          incorrectas,
          blancas,
          dobles,
          estado: 'PROCESADO',
          procesadoEn: new Date(),
        },

        create: {
          inscripcionId: inscripcion.id,

          puntajeTotal,
          correctas,
          incorrectas,
          blancas,
          dobles,
          estado: 'PROCESADO',
        },
      });

      await tx.detalleResultado.deleteMany({
        where: {
          resultadoId: resultadoGuardado.id,
        },
      });

      await tx.detalleResultado.createMany({
        data: detalles.map((detalle) => ({
          resultadoId: resultadoGuardado.id,

          ...detalle,
        })),
      });

      return resultadoGuardado;
    });

    return {
      resultadoId: resultado.id,

      alumno: {
        id: inscripcion.alumno.id,
        dni: inscripcion.alumno.dni,
        nombre: `${inscripcion.alumno.nombres} ${inscripcion.alumno.apellidos}`,
      },

      carrera: inscripcion.carrera.nombre,

      grupo: inscripcion.grupo.codigo,

      simulacroId: inscripcion.simulacroId,

      correctas,
      incorrectas,
      blancas,
      dobles,

      puntajeTotal,
      puntajeMaximo,
    };
  }

  // =====================================================
  // RESULTADO POR INSCRIPCIÓN
  // =====================================================

  async findByInscripcion(inscripcionId: number) {
    const resultado = await this.prisma.resultado.findUnique({
      where: {
        inscripcionId,
      },

      include: {
        inscripcion: {
          include: {
            alumno: true,
            carrera: true,
            grupo: true,
            simulacro: true,
          },
        },

        detalles: {
          include: {
            pregunta: {
              include: {
                area: true,
              },
            },
          },

          orderBy: {
            pregunta: {
              numero: 'asc',
            },
          },
        },
      },
    });

    if (!resultado) {
      throw new NotFoundException('Resultado no encontrado');
    }

    return resultado;
  }

  // =====================================================
  // RANKING POR CARRERA
  // =====================================================

  async rankingCarrera(simulacroId: number, carreraId: number) {
    const resultados = await this.prisma.resultado.findMany({
      where: {
        inscripcion: {
          simulacroId,
          carreraId,
          estado: true,
        },
      },

      include: {
        inscripcion: {
          include: {
            alumno: true,
            carrera: true,
            grupo: true,
          },
        },
      },

      orderBy: [
        {
          puntajeTotal: 'desc',
        },

        {
          correctas: 'desc',
        },
      ],
    });

    return resultados.map((resultado, index) => ({
      puesto: index + 1,

      alumno: {
        dni: resultado.inscripcion.alumno.dni,

        nombre: `${resultado.inscripcion.alumno.nombres} ${resultado.inscripcion.alumno.apellidos}`,
      },

      carrera: resultado.inscripcion.carrera.nombre,

      grupo: resultado.inscripcion.grupo.codigo,

      correctas: resultado.correctas,

      incorrectas: resultado.incorrectas,

      blancas: resultado.blancas,

      dobles: resultado.dobles,

      puntaje: resultado.puntajeTotal,
    }));
  }
  async resumenSimulacro(simulacroId: number) {
    const resultados = await this.prisma.resultado.findMany({
      where: {
        inscripcion: {
          simulacroId,
          estado: true,
        },
      },

      include: {
        inscripcion: {
          include: {
            simulacro: true,
          },
        },
      },
    });

    if (resultados.length === 0) {
      throw new NotFoundException('No existen resultados para este simulacro');
    }

    const puntajes = resultados.map((r) => r.puntajeTotal);

    const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;

    return {
      simulacroId,

      totalPostulantes: resultados.length,

      promedio: this.redondear(promedio),

      mejorPuntaje: Math.max(...puntajes),

      menorPuntaje: Math.min(...puntajes),
    };
  }
  async rankingGeneral(simulacroId: number) {
    const resultados = await this.prisma.resultado.findMany({
      where: {
        inscripcion: {
          simulacroId,
          estado: true,
        },
      },

      include: {
        inscripcion: {
          include: {
            alumno: true,
            carrera: true,
            grupo: true,
          },
        },
      },

      orderBy: [
        {
          puntajeTotal: 'desc',
        },
        {
          correctas: 'desc',
        },
      ],
    });

    if (resultados.length === 0) {
      throw new NotFoundException('No existen resultados para este simulacro');
    }

    return resultados.map((resultado, index) => ({
      puesto: index + 1,

      alumno: {
        dni: resultado.inscripcion.alumno.dni,

        nombre: `${resultado.inscripcion.alumno.nombres} ${resultado.inscripcion.alumno.apellidos}`,
      },

      carrera: resultado.inscripcion.carrera.nombre,

      grupo: resultado.inscripcion.grupo.codigo,

      correctas: resultado.correctas,

      incorrectas: resultado.incorrectas,

      blancas: resultado.blancas,

      dobles: resultado.dobles,

      puntaje: resultado.puntajeTotal,
    }));
  }
  async estadisticasArea(simulacroId: number) {
    const detalles = await this.prisma.detalleResultado.findMany({
      where: {
        resultado: {
          inscripcion: {
            simulacroId,
          },
        },
      },

      include: {
        pregunta: {
          include: {
            area: true,
          },
        },
      },
    });

    const areas = new Map();

    for (const detalle of detalles) {
      const nombreArea = detalle.pregunta.area.nombre;

      if (!areas.has(nombreArea)) {
        areas.set(nombreArea, {
          area: nombreArea,
          total: 0,
          correctas: 0,
          incorrectas: 0,
          blancas: 0,
        });
      }

      const item = areas.get(nombreArea);

      item.total++;

      if (detalle.tipo === 'CORRECTA') {
        item.correctas++;
      }

      if (detalle.tipo === 'INCORRECTA') {
        item.incorrectas++;
      }

      if (detalle.tipo === 'BLANCO') {
        item.blancas++;
      }
    }

    return Array.from(areas.values()).map((item) => ({
      area: item.area,

      totalPreguntas: item.total,

      correctas: item.correctas,

      incorrectas: item.incorrectas,

      blancas: item.blancas,

      rendimiento: this.redondear((item.correctas / item.total) * 100),
    }));
  }
}
