import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateAlumnoDto } from './dto/create-alumno.dto.js';
import { UpdateAlumnoDto } from './dto/update-alumno.dto.js';

@Injectable()
export class AlumnosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateAlumnoDto) {
    const alumnoExistente =
      await this.prisma.alumno.findUnique({
        where: {
          dni: dto.dni.trim(),
        },
      });

    if (alumnoExistente) {
      throw new ConflictException(
        'Ya existe un alumno registrado con ese DNI',
      );
    }

    return this.prisma.alumno.create({
      data: {
        dni: dto.dni.trim(),
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        telefono: dto.telefono?.trim(),
        correo: dto.correo?.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.alumno.findMany({
      orderBy: [
        {
          apellidos: 'asc',
        },
        {
          nombres: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const alumno =
      await this.prisma.alumno.findUnique({
        where: {
          id,
        },
      });

    if (!alumno) {
      throw new NotFoundException(
        'Alumno no encontrado',
      );
    }

    return alumno;
  }

  async findByDni(dni: string) {
    const alumno =
      await this.prisma.alumno.findUnique({
        where: {
          dni,
        },
      });

    if (!alumno) {
      throw new NotFoundException(
        'Alumno no encontrado',
      );
    }

    return alumno;
  }

  async update(
    id: number,
    dto: UpdateAlumnoDto,
  ) {
    await this.findOne(id);

    if (dto.dni !== undefined) {
      const alumnoConDni =
        await this.prisma.alumno.findUnique({
          where: {
            dni: dto.dni.trim(),
          },
        });

      if (
        alumnoConDni &&
        alumnoConDni.id !== id
      ) {
        throw new ConflictException(
          'El DNI ya pertenece a otro alumno',
        );
      }
    }

    return this.prisma.alumno.update({
      where: {
        id,
      },

      data: {
        ...(dto.dni !== undefined && {
          dni: dto.dni.trim(),
        }),

        ...(dto.nombres !== undefined && {
          nombres: dto.nombres.trim(),
        }),

        ...(dto.apellidos !== undefined && {
          apellidos: dto.apellidos.trim(),
        }),

        ...(dto.telefono !== undefined && {
          telefono: dto.telefono.trim(),
        }),

        ...(dto.correo !== undefined && {
          correo: dto.correo.trim(),
        }),

        ...(dto.estado !== undefined && {
          estado: dto.estado,
        }),
      },
    });
  }

  async desactivar(id: number) {
    await this.findOne(id);

    return this.prisma.alumno.update({
      where: {
        id,
      },

      data: {
        estado: false,
      },
    });
  }
}