import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async resumen() {
    const [totalAlumnos, totalSimulacros, totalResultados, promedio] =
      await Promise.all([
        this.prisma.alumno.count(),

        this.prisma.simulacro.count(),

        this.prisma.resultado.count(),

        this.prisma.resultado.aggregate({
          _avg: {
            puntajeTotal: true,
          },
        }),
      ]);

    return {
      totalAlumnos,

      totalSimulacros,

      fichasProcesadas: totalResultados,

      promedioGeneral: promedio._avg.puntajeTotal ?? 0,
    };
  }

  async ranking(simulacroId: number) {
    const resultados = await this.prisma.resultado.findMany({
      where: {
        inscripcion: {
          simulacroId,
        },
      },

      orderBy: {
        puntajeTotal: 'desc',
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
    });

    return resultados.map((resultado, index) => ({
      puesto: index + 1,

      alumno:
        resultado.inscripcion.alumno.nombres +
        ' ' +
        resultado.inscripcion.alumno.apellidos,

      dni: resultado.inscripcion.alumno.dni,

      carrera: resultado.inscripcion.carrera.nombre,

      grupo: resultado.inscripcion.grupo.codigo,

      puntaje: resultado.puntajeTotal,
    }));
  }

  async estadisticas(simulacroId: number) {
    const resultados = await this.prisma.resultado.findMany({
      where: {
        inscripcion: {
          simulacroId,
        },
      },

      select: {
        puntajeTotal: true,
      },
    });

    const puntajes = resultados.map((r) => r.puntajeTotal);

    const total = puntajes.length;

    const promedio =
      total > 0 ? puntajes.reduce((a, b) => a + b, 0) / total : 0;

    const mayor = total > 0 ? Math.max(...puntajes) : 0;

    const menor = total > 0 ? Math.min(...puntajes) : 0;

    return {
      simulacroId,

      participantes: total,

      promedio: Number(promedio.toFixed(2)),

      mayorPuntaje: mayor,

      menorPuntaje: menor,
    };
  }
  async rendimientoPorArea(simulacroId: number) {
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

    const agrupado: any = {};

    detalles.forEach((detalle) => {
      const area = detalle.pregunta.area.nombre;

      if (!agrupado[area]) {
        agrupado[area] = {
          suma: 0,
          cantidad: 0,
        };
      }

      agrupado[area].suma += detalle.puntajeObtenido;
      agrupado[area].cantidad++;
    });

    return Object.keys(agrupado).map((area) => ({
      area,

      rendimiento: Number(
        (agrupado[area].suma / agrupado[area].cantidad).toFixed(2),
      ),
    }));
  }
}
