import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';

@Injectable()
export class CarrerasService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCarreraDto) {
    const grupo = await this.prisma.grupo.findUnique({
      where: {
        id: dto.grupoId,
      },
    });

    if (!grupo) {
      throw new NotFoundException(
        'El grupo indicado no existe',
      );
    }

    const carreraExistente =
      await this.prisma.carrera.findUnique({
        where: {
          nombre: dto.nombre.trim(),
        },
      });

    if (carreraExistente) {
      throw new ConflictException(
        'Ya existe una carrera con ese nombre',
      );
    }

    return this.prisma.carrera.create({
      data: {
        nombre: dto.nombre.trim(),
        grupoId: dto.grupoId,
      },

      include: {
        grupo: true,
      },
    });
  }

  async findAll() {
    return this.prisma.carrera.findMany({
      include: {
        grupo: true,
      },

      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const carrera =
      await this.prisma.carrera.findUnique({
        where: {
          id,
        },

        include: {
          grupo: true,
        },
      });

    if (!carrera) {
      throw new NotFoundException(
        'Carrera no encontrada',
      );
    }

    return carrera;
  }

  async update(
    id: number,
    dto: UpdateCarreraDto,
  ) {
    await this.findOne(id);

    if (dto.grupoId !== undefined) {
      const grupo =
        await this.prisma.grupo.findUnique({
          where: {
            id: dto.grupoId,
          },
        });

      if (!grupo) {
        throw new NotFoundException(
          'El grupo indicado no existe',
        );
      }
    }

    if (dto.nombre !== undefined) {
      const carreraConMismoNombre =
        await this.prisma.carrera.findUnique({
          where: {
            nombre: dto.nombre.trim(),
          },
        });

      if (
        carreraConMismoNombre &&
        carreraConMismoNombre.id !== id
      ) {
        throw new ConflictException(
          'Ya existe una carrera con ese nombre',
        );
      }
    }

    return this.prisma.carrera.update({
      where: {
        id,
      },

      data: {
        ...(dto.nombre !== undefined && {
          nombre: dto.nombre.trim(),
        }),

        ...(dto.grupoId !== undefined && {
          grupoId: dto.grupoId,
        }),

        ...(dto.estado !== undefined && {
          estado: dto.estado,
        }),
      },

      include: {
        grupo: true,
      },
    });
  }

  async desactivar(id: number) {
    await this.findOne(id);

    return this.prisma.carrera.update({
      where: {
        id,
      },

      data: {
        estado: false,
      },

      include: {
        grupo: true,
      },
    });
  }
}