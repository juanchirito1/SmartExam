import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePreguntaDto } from './dto/create-pregunta.dto.js';
import { UpdatePreguntaDto } from './dto/update-pregunta.dto.js';
import { CargarClaveDto } from './dto/cargar-clave.dto.js';

@Injectable()
export class PreguntasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private validarAlternativa(
    respuesta: string,
  ) {
    const alternativa =
      respuesta.trim().toUpperCase();

    const permitidas = [
      'A',
      'B',
      'C',
      'D',
      'E',
    ];

    if (!permitidas.includes(alternativa)) {
      throw new BadRequestException(
        'La respuesta correcta debe ser A, B, C, D o E',
      );
    }

    return alternativa;
  }

  private async obtenerSimulacro(
    simulacroId: number,
  ) {
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

    if (simulacro.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede modificar la clave de un simulacro cerrado',
      );
    }

    return simulacro;
  }

  async create(
    dto: CreatePreguntaDto,
  ) {
    const simulacro =
      await this.obtenerSimulacro(
        dto.simulacroId,
      );

    if (
      dto.numero < 1 ||
      dto.numero > simulacro.totalPreguntas
    ) {
      throw new BadRequestException(
        `El número de pregunta debe estar entre 1 y ${simulacro.totalPreguntas}`,
      );
    }

    const area =
      await this.prisma.area.findUnique({
        where: {
          id: dto.areaId,
        },
      });

    if (!area) {
      throw new NotFoundException(
        'El área indicada no existe',
      );
    }

    const existente =
      await this.prisma.pregunta.findUnique({
        where: {
          simulacroId_numero: {
            simulacroId: dto.simulacroId,
            numero: dto.numero,
          },
        },
      });

    if (existente) {
      throw new ConflictException(
        `La pregunta ${dto.numero} ya está registrada para este simulacro`,
      );
    }

    const respuesta =
      this.validarAlternativa(
        dto.respuestaCorrecta,
      );

    return this.prisma.pregunta.create({
      data: {
        numero: dto.numero,
        respuestaCorrecta: respuesta,
        simulacroId: dto.simulacroId,
        areaId: dto.areaId,
      },

      include: {
        area: true,
        simulacro: true,
      },
    });
  }

  async findBySimulacro(
    simulacroId: number,
  ) {
    const simulacro =
      await this.prisma.simulacro.findUnique({
        where: {
          id: simulacroId,
        },
      });

    if (!simulacro) {
      throw new NotFoundException(
        'Simulacro no encontrado',
      );
    }

    return this.prisma.pregunta.findMany({
      where: {
        simulacroId,
      },

      include: {
        area: true,
      },

      orderBy: {
        numero: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const pregunta =
      await this.prisma.pregunta.findUnique({
        where: {
          id,
        },

        include: {
          area: true,
          simulacro: true,
        },
      });

    if (!pregunta) {
      throw new NotFoundException(
        'Pregunta no encontrada',
      );
    }

    return pregunta;
  }

  async update(
    id: number,
    dto: UpdatePreguntaDto,
  ) {
    const pregunta =
      await this.findOne(id);

    const simulacro =
      await this.obtenerSimulacro(
        pregunta.simulacroId,
      );

    if (dto.numero !== undefined) {
      if (
        dto.numero < 1 ||
        dto.numero >
          simulacro.totalPreguntas
      ) {
        throw new BadRequestException(
          `El número de pregunta debe estar entre 1 y ${simulacro.totalPreguntas}`,
        );
      }
    }

    if (dto.areaId !== undefined) {
      const area =
        await this.prisma.area.findUnique({
          where: {
            id: dto.areaId,
          },
        });

      if (!area) {
        throw new NotFoundException(
          'El área indicada no existe',
        );
      }
    }

    let respuestaCorrecta:
      | string
      | undefined;

    if (
      dto.respuestaCorrecta !== undefined
    ) {
      respuestaCorrecta =
        this.validarAlternativa(
          dto.respuestaCorrecta,
        );
    }

    return this.prisma.pregunta.update({
      where: {
        id,
      },

      data: {
        ...(dto.numero !== undefined && {
          numero: dto.numero,
        }),

        ...(dto.areaId !== undefined && {
          areaId: dto.areaId,
        }),

        ...(respuestaCorrecta !==
          undefined && {
          respuestaCorrecta,
        }),
      },

      include: {
        area: true,
        simulacro: true,
      },
    });
  }

  async cargarClaveCompleta(
    dto: CargarClaveDto,
  ) {
    const simulacro =
      await this.obtenerSimulacro(
        dto.simulacroId,
      );

    if (
      dto.preguntas.length !==
      simulacro.totalPreguntas
    ) {
      throw new BadRequestException(
        `La clave debe contener exactamente ${simulacro.totalPreguntas} preguntas`,
      );
    }

    const numeros =
      dto.preguntas.map(
        (pregunta) => pregunta.numero,
      );

    const numerosUnicos =
      new Set(numeros);

    if (
      numerosUnicos.size !==
      simulacro.totalPreguntas
    ) {
      throw new BadRequestException(
        'Existen números de pregunta repetidos',
      );
    }

    for (
      let numero = 1;
      numero <=
      simulacro.totalPreguntas;
      numero++
    ) {
      if (!numerosUnicos.has(numero)) {
        throw new BadRequestException(
          `Falta la pregunta número ${numero}`,
        );
      }
    }

    const areas =
      await this.prisma.area.findMany();

    const areasValidas =
      new Set(
        areas.map(
          (area) => area.id,
        ),
      );

    const preguntasPreparadas =
      dto.preguntas.map(
        (pregunta) => {
          if (
            !areasValidas.has(
              pregunta.areaId,
            )
          ) {
            throw new BadRequestException(
              `El área ${pregunta.areaId} no existe`,
            );
          }

          return {
            numero:
              pregunta.numero,

            areaId:
              pregunta.areaId,

            respuestaCorrecta:
              this.validarAlternativa(
                pregunta.respuestaCorrecta,
              ),

            simulacroId:
              dto.simulacroId,
          };
        },
      );

    // Regla actual:
    // 80 preguntas =
    // 20 por cada una de las 4 áreas.
    if (
      simulacro.totalPreguntas === 80
    ) {
      const contador =
        new Map<number, number>();

      for (
        const pregunta
        of preguntasPreparadas
      ) {
        contador.set(
          pregunta.areaId,
          (contador.get(
            pregunta.areaId,
          ) ?? 0) + 1,
        );
      }

      if (contador.size !== 4) {
        throw new BadRequestException(
          'El examen de 80 preguntas debe utilizar las 4 áreas',
        );
      }

      for (
        const cantidad
        of contador.values()
      ) {
        if (cantidad !== 20) {
          throw new BadRequestException(
            'El examen de 80 preguntas debe tener 20 preguntas por cada área',
          );
        }
      }
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.pregunta.deleteMany({
          where: {
            simulacroId:
              dto.simulacroId,
          },
        });

        await tx.pregunta.createMany({
          data:
            preguntasPreparadas,
        });
      },
    );

    return {
      mensaje:
        'Clave registrada correctamente',

      simulacroId:
        dto.simulacroId,

      totalPreguntas:
        preguntasPreparadas.length,
    };
  }
}