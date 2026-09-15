import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSimulacroDto } from './dto/create-simulacro.dto.js';
import { UpdateSimulacroDto } from './dto/update-simulacro.dto.js';

@Injectable()
export class SimulacrosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSimulacroDto) {
    const ciclo =
      await this.prisma.ciclo.findUnique({
        where: {
          id: dto.cicloId,
        },
      });

    if (!ciclo) {
      throw new NotFoundException(
        'El ciclo indicado no existe',
      );
    }

    const existente =
      await this.prisma.simulacro.findUnique({
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

    return this.prisma.simulacro.create({
      data: {
        numero: dto.numero,
        fecha: new Date(dto.fecha),
        cicloId: dto.cicloId,
        totalPreguntas:
          dto.totalPreguntas ?? 80,
      },
      include: {
        ciclo: true,
      },
    });
  }

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

  async findOne(id: number) {
    const simulacro =
      await this.prisma.simulacro.findUnique({
        where: {
          id,
        },
        include: {
          ciclo: true,
        },
      });

    if (!simulacro) {
      throw new NotFoundException(
        'Simulacro no encontrado',
      );
    }

    return simulacro;
  }

  async update(
    id: number,
    dto: UpdateSimulacroDto,
  ) {
    await this.findOne(id);

    return this.prisma.simulacro.update({
      where: {
        id,
      },
      data: {
        ...(dto.numero !== undefined && {
          numero: dto.numero,
        }),
        ...(dto.fecha !== undefined && {
          fecha: new Date(dto.fecha),
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
  }
}