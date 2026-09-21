import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateInscripcionDto } from './dto/create-inscripcion.dto.js';

import { UpdateInscripcionDto } from './dto/update-inscripcion.dto.js';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREAR
  // =========================================================

  async create(dto: CreateInscripcionDto) {
    const [alumno, simulacro, carrera] = await Promise.all([
      this.prisma.alumno.findUnique({
        where: {
          id: dto.alumnoId,
        },
      }),

      this.prisma.simulacro.findUnique({
        where: {
          id: dto.simulacroId,
        },
      }),

      this.prisma.carrera.findUnique({
        where: {
          id: dto.carreraId,
        },

        include: {
          grupo: true,
        },
      }),
    ]);

    // =======================================================
    // ALUMNO
    // =======================================================

    if (!alumno) {
      throw new NotFoundException('El alumno indicado no existe');
    }

    if (!alumno.estado) {
      throw new BadRequestException('El alumno se encuentra inactivo');
    }

    // =======================================================
    // SIMULACRO
    // =======================================================

    if (!simulacro) {
      throw new NotFoundException('El simulacro indicado no existe');
    }

    if (simulacro.estado === 'FINALIZADO' || simulacro.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede registrar una inscripción en un simulacro finalizado',
      );
    }

    // =======================================================
    // CARRERA
    // =======================================================

    if (!carrera) {
      throw new NotFoundException('La carrera indicada no existe');
    }

    if (!carrera.estado) {
      throw new BadRequestException(
        'La carrera seleccionada se encuentra inactiva',
      );
    }

    // =======================================================
    // DUPLICIDAD
    // =======================================================

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

    // =======================================================
    // CREAR
    // =======================================================

    try {
      return await this.prisma.inscripcion.create({
        data: {
          alumnoId: dto.alumnoId,

          simulacroId: dto.simulacroId,

          carreraId: dto.carreraId,

          /*
              Snapshot del grupo en el momento
              de la inscripción.
            */

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
    } catch (error) {
      /*
        Protección contra condición de carrera.

        Aunque dos peticiones intentaran registrar
        simultáneamente al mismo alumno, PostgreSQL
        sigue siendo la última barrera.
      */

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'El alumno ya está inscrito en este simulacro',
        );
      }

      throw error;
    }
  }

  // =========================================================
  // LISTAR
  // =========================================================

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

  // =========================================================
  // OBTENER
  // =========================================================

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        id,
      },

      include: {
        alumno: true,

        carrera: true,

        grupo: true,

        resultado: true,

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

  // =========================================================
  // POR SIMULACRO
  // =========================================================

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

  // =========================================================
  // POR ALUMNO
  // =========================================================

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

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  async update(id: number, dto: UpdateInscripcionDto) {
    const inscripcion = await this.findOne(id);

    let nuevoGrupoId: number | undefined;

    // =======================================================
    // CAMBIO DE CARRERA
    // =======================================================

    if (
      dto.carreraId !== undefined &&
      dto.carreraId !== inscripcion.carreraId
    ) {
      /*
        Una vez calificado el examen, cambiar
        carrera/grupo alteraría las reglas con
        las que debería interpretarse el resultado.
      */

      if (inscripcion.resultado) {
        throw new BadRequestException(
          'No se puede cambiar la carrera de una inscripción que ya tiene un resultado procesado',
        );
      }

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

    // =======================================================
    // REACTIVACIÓN
    // =======================================================

    if (dto.estado === true && !inscripcion.estado) {
      if (!inscripcion.alumno.estado) {
        throw new BadRequestException(
          'No se puede reactivar la inscripción porque el alumno se encuentra inactivo',
        );
      }

      if (!inscripcion.carrera.estado) {
        throw new BadRequestException(
          'No se puede reactivar la inscripción porque la carrera se encuentra inactiva',
        );
      }
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

  // =========================================================
  // DESACTIVAR
  // =========================================================

  async desactivar(id: number) {
    const inscripcion = await this.findOne(id);

    if (!inscripcion.estado) {
      return inscripcion;
    }

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
