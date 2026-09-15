import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCicloDto } from './dto/create-ciclo.dto.js';
import { UpdateCicloDto } from './dto/update-ciclo.dto.js';

@Injectable()
export class CiclosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCicloDto) {
    const existente =
      await this.prisma.ciclo.findUnique({
        where: {
          nombre: dto.nombre.trim(),
        },
      });

    if (existente) {
      throw new ConflictException(
        'Ya existe un ciclo con ese nombre',
      );
    }

    return this.prisma.ciclo.create({
      data: {
        nombre: dto.nombre.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.ciclo.findMany({
      include: {
        simulacros: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const ciclo =
      await this.prisma.ciclo.findUnique({
        where: {
          id,
        },
        include: {
          simulacros: true,
        },
      });

    if (!ciclo) {
      throw new NotFoundException(
        'Ciclo no encontrado',
      );
    }

    return ciclo;
  }

  async update(
    id: number,
    dto: UpdateCicloDto,
  ) {
    await this.findOne(id);

    return this.prisma.ciclo.update({
      where: {
        id,
      },
      data: {
        ...(dto.nombre !== undefined && {
          nombre: dto.nombre.trim(),
        }),
        ...(dto.estado !== undefined && {
          estado: dto.estado,
        }),
      },
    });
  }
}