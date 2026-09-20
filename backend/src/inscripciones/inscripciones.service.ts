import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateInscripcionDto } from './dto/create-inscripcion.dto.js';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto.js';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInscripcionDto) {
    // ===================================================
    // 1. Validamos alumno
    // ===================================================

    const alumno = await this.prisma.alumno.findUnique({
      where: {
        id: dto.alumnoId,
      },
    });

    if (!alumno) {
      throw new NotFoundException('El alumno indicado no existe');
    }

    if (!alumno.estado) {
      throw new BadRequestException('El alumno se encuentra inactivo');
    }

    // ===================================================
    // 2. Validamos simulacro
    // ===================================================

    const simulacro = await this.prisma.simulacro.findUnique({
      where: {
        id: dto.simulacroId,
      },
    });

    if (!simulacro) {
      throw new NotFoundException('El simulacro indicado no existe');
    }

    if (simulacro.estado === 'FINALIZADO' || simulacro.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede registrar una inscripción en un simulacro finalizado',
      );
    }

    // ===================================================
    // 3. Validamos carrera
    // ===================================================

    const carrera = await this.prisma.carrera.findUnique({
      where: {
        id: dto.carreraId,
      },

      include: {
        grupo: true,
      },
    });

    if (!carrera) {
      throw new NotFoundException('La carrera indicada no existe');
    }

    if (!carrera.estado) {
      throw new BadRequestException(
        'La carrera seleccionada se encuentra inactiva',
      );
    }

    // ===================================================
    // 4. Evitamos doble inscripción
    // ===================================================

    const existente = await this.prisma.inscripcion.findUnique({
      where: {
        alumnoId_simulacroId: {
          alumnoId: dto.alumnoId,
          simulacroId: dto.simulacroId,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        'El alumno ya está inscrito en este simulacro',
      );
    }

    // ===================================================
    // 5. Creamos inscripción
    // ===================================================

    return this.prisma.inscripcion.create({
      data: {
        alumnoId: dto.alumnoId,
        simulacroId: dto.simulacroId,
        carreraId: dto.carreraId,

        // Se toma automáticamente de la carrera.
        grupoId: carrera.grupoId,
      },

      include: {
        alumno: true,

        carrera: {
          include: {
            grupo: true,
          },
        },

        grupo: true,

        simulacro: {
          include: {
            ciclo: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.inscripcion.findMany({
      include: {
        alumno: true,

        carrera: true,

        grupo: true,

        simulacro: {
          include: {
            ciclo: true,
          },
        },
      },

      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        id,
      },

      include: {
        alumno: true,

        carrera: true,

        grupo: true,

        simulacro: {
          include: {
            ciclo: true,
          },
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    return inscripcion;
  }

  async findBySimulacro(simulacroId: number) {
    return this.prisma.inscripcion.findMany({
      where: {
        simulacroId,
        estado: true,
      },

      include: {
        alumno: true,
        carrera: true,
        grupo: true,
      },

      orderBy: {
        alumno: {
          apellidos: 'asc',
        },
      },
    });
  }

  async findByAlumno(alumnoId: number) {
    return this.prisma.inscripcion.findMany({
      where: {
        alumnoId,
      },

      include: {
        carrera: true,
        grupo: true,

        simulacro: {
          include: {
            ciclo: true,
          },
        },
      },

      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  async update(id: number, dto: UpdateInscripcionDto) {
    const inscripcion = await this.findOne(id);

    let nuevoGrupoId: number | undefined;

    if (dto.carreraId !== undefined) {
      const carrera = await this.prisma.carrera.findUnique({
        where: {
          id: dto.carreraId,
        },
      });

      if (!carrera) {
        throw new NotFoundException('La carrera indicada no existe');
      }

      if (!carrera.estado) {
        throw new BadRequestException(
          'La carrera seleccionada se encuentra inactiva',
        );
      }

      nuevoGrupoId = carrera.grupoId;
    }

    return this.prisma.inscripcion.update({
      where: {
        id: inscripcion.id,
      },

      data: {
        ...(dto.carreraId !== undefined && {
          carreraId: dto.carreraId,
        }),

        ...(nuevoGrupoId !== undefined && {
          grupoId: nuevoGrupoId,
        }),

        ...(dto.estado !== undefined && {
          estado: dto.estado,
        }),
      },

      include: {
        alumno: true,
        carrera: true,
        grupo: true,

        simulacro: {
          include: {
            ciclo: true,
          },
        },
      },
    });
  }

  async desactivar(id: number) {
    await this.findOne(id);

    return this.prisma.inscripcion.update({
      where: {
        id,
      },

      data: {
        estado: false,
      },
    });
  }
}
