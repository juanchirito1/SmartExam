import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      orderBy: {
        nombre: 'asc',
      },

      select: {
        id: true,
        nombre: true,
        correo: true,
        estado: true,
        creadoEn: true,

        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        nombre: true,
        correo: true,
        estado: true,
        creadoEn: true,

        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async create(data: {
    nombre: string;
    correo: string;
    password: string;
    rolId: number;
  }) {
    const existente = await this.prisma.usuario.findUnique({
      where: {
        correo: data.correo.trim(),
      },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const rol = await this.prisma.rol.findUnique({
      where: {
        id: data.rolId,
      },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre.trim(),

        correo: data.correo.trim().toLowerCase(),

        passwordHash,

        rolId: data.rolId,
      },

      select: {
        id: true,
        nombre: true,
        correo: true,
        estado: true,

        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return usuario;
  }

  async update(
    id: number,
    data: {
      nombre?: string;
      correo?: string;
      password?: string;
      rolId?: number;
      estado?: boolean;
    },
  ) {
    await this.findOne(id);

    if (data.correo !== undefined) {
      const existente = await this.prisma.usuario.findUnique({
        where: {
          correo: data.correo.trim().toLowerCase(),
        },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException('El correo ya pertenece a otro usuario');
      }
    }

    if (data.rolId !== undefined) {
      const rol = await this.prisma.rol.findUnique({
        where: {
          id: data.rolId,
        },
      });

      if (!rol) {
        throw new NotFoundException('Rol no encontrado');
      }
    }

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    return this.prisma.usuario.update({
      where: {
        id,
      },

      data: {
        ...(data.nombre !== undefined && {
          nombre: data.nombre.trim(),
        }),

        ...(data.correo !== undefined && {
          correo: data.correo.trim().toLowerCase(),
        }),

        ...(data.rolId !== undefined && {
          rolId: data.rolId,
        }),

        ...(data.estado !== undefined && {
          estado: data.estado,
        }),

        ...(passwordHash !== undefined && {
          passwordHash,
        }),
      },

      select: {
        id: true,
        nombre: true,
        correo: true,
        estado: true,

        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async findRoles() {
    return this.prisma.rol.findMany({
      orderBy: {
        nombre: 'asc',
      },

      select: {
        id: true,
        nombre: true,
      },
    });
  }
}
