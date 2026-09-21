import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateSimulacroDto } from './dto/create-simulacro.dto.js';

import { UpdateSimulacroDto } from './dto/update-simulacro.dto.js';

@Injectable()
export class SimulacrosService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // VALIDACIONES
  // =========================================================

  private validarTotalPreguntas(total: number) {
    if (!Number.isInteger(total) || total <= 0 || total > 120) {
      throw new BadRequestException(
        'El total de preguntas debe ser un número entero entre 1 y 120',
      );
    }
  }

  private validarEstado(estado: string) {
    const permitidos = ['BORRADOR', 'ACTIVO', 'FINALIZADO'];

    if (!permitidos.includes(estado)) {
      throw new BadRequestException(
        'Estado de simulacro no válido. Los estados permitidos son BORRADOR, ACTIVO y FINALIZADO',
      );
    }
  }

  private validarFecha(valor: string | Date) {
    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      throw new BadRequestException('La fecha del simulacro no es válida');
    }

    return fecha;
  }

  // =========================================================
  // CREAR
  // =========================================================

  async create(dto: CreateSimulacroDto) {
    const ciclo = await this.prisma.ciclo.findUnique({
      where: {
        id: dto.cicloId,
      },
    });

    if (!ciclo) {
      throw new NotFoundException('El ciclo indicado no existe');
    }

    if (!ciclo.estado) {
      throw new BadRequestException(
        'No se puede crear un simulacro dentro de un ciclo inactivo',
      );
    }

    if (!Number.isInteger(dto.numero) || dto.numero <= 0) {
      throw new BadRequestException(
        'El número del simulacro debe ser mayor que cero',
      );
    }

    const totalPreguntas = dto.totalPreguntas ?? 80;

    this.validarTotalPreguntas(totalPreguntas);

    const fecha = this.validarFecha(dto.fecha);

    const existente = await this.prisma.simulacro.findUnique({
      where: {
        cicloId_numero: {
          cicloId: dto.cicloId,

          numero: dto.numero,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe ese número de simulacro en el ciclo',
      );
    }

    try {
      return await this.prisma.simulacro.create({
        data: {
          numero: dto.numero,

          fecha,

          cicloId: dto.cicloId,

          totalPreguntas,
        },

        include: {
          ciclo: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe ese número de simulacro en el ciclo',
        );
      }

      throw error;
    }
  }

  // =========================================================
  // LISTAR
  // =========================================================

  async findAll() {
    return this.prisma.simulacro.findMany({
      include: {
        ciclo: true,
      },

      orderBy: {
        fecha: 'desc',
      },
    });
  }

  // =========================================================
  // OBTENER
  // =========================================================

  async findOne(id: number) {
    const simulacro = await this.prisma.simulacro.findUnique({
      where: {
        id,
      },

      include: {
        ciclo: true,

        _count: {
          select: {
            preguntas: true,

            inscripciones: true,
          },
        },
      },
    });

    if (!simulacro) {
      throw new NotFoundException('Simulacro no encontrado');
    }

    return simulacro;
  }

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  async update(id: number, dto: UpdateSimulacroDto) {
    const simulacro = await this.findOne(id);

    /*
      Una evaluación finalizada queda
      estructuralmente congelada.
    */

    if (
      simulacro.estado === 'FINALIZADO' &&
      (dto.numero !== undefined ||
        dto.fecha !== undefined ||
        dto.totalPreguntas !== undefined)
    ) {
      throw new BadRequestException(
        'No se pueden modificar los datos estructurales de un simulacro finalizado',
      );
    }

    // =======================================================
    // NÚMERO
    // =======================================================

    if (dto.numero !== undefined) {
      if (!Number.isInteger(dto.numero) || dto.numero <= 0) {
        throw new BadRequestException(
          'El número del simulacro debe ser mayor que cero',
        );
      }
    }

    // =======================================================
    // FECHA
    // =======================================================

    let fecha: Date | undefined;

    if (dto.fecha !== undefined) {
      fecha = this.validarFecha(dto.fecha);
    }

    // =======================================================
    // TOTAL PREGUNTAS
    // =======================================================

    if (
      dto.totalPreguntas !== undefined &&
      dto.totalPreguntas !== simulacro.totalPreguntas
    ) {
      this.validarTotalPreguntas(dto.totalPreguntas);

      /*
        Una vez cargada la clave, cambiar este
        número dejaría clave y configuración
        en estados incompatibles.
      */

      if (simulacro._count.preguntas > 0) {
        throw new BadRequestException(
          'No se puede cambiar el total de preguntas después de haber cargado la clave del simulacro',
        );
      }
    }

    // =======================================================
    // ESTADO
    // =======================================================

    if (dto.estado !== undefined) {
      this.validarEstado(dto.estado);

      /*
        Para activar un simulacro necesitamos
        una clave completa.
      */

      if (dto.estado === 'ACTIVO' && simulacro.estado !== 'ACTIVO') {
        const totalPreguntas = dto.totalPreguntas ?? simulacro.totalPreguntas;

        if (simulacro._count.preguntas !== totalPreguntas) {
          throw new BadRequestException(
            `No se puede activar el simulacro. La clave contiene ${simulacro._count.preguntas} preguntas y se requieren ${totalPreguntas}`,
          );
        }
      }
    }

    try {
      return await this.prisma.simulacro.update({
        where: {
          id,
        },

        data: {
          ...(dto.numero !== undefined && {
            numero: dto.numero,
          }),

          ...(fecha !== undefined && {
            fecha,
          }),

          ...(dto.totalPreguntas !== undefined && {
            totalPreguntas: dto.totalPreguntas,
          }),

          ...(dto.estado !== undefined && {
            estado: dto.estado,
          }),
        },

        include: {
          ciclo: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe ese número de simulacro en el ciclo',
        );
      }

      throw error;
    }
  }
}
