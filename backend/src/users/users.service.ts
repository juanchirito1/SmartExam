import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';



@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // LISTAR USUARIOS
  // =========================================================

  // =========================================================
// MÉTODOS DE COMPATIBILIDAD CON USERS CONTROLLER
// =========================================================

async findAll() {
  return this.listarUsuarios();
}


async findRoles() {
  return this.listarRoles();
}


async findOne(
  id: number,
) {
  return this.obtenerUsuario(
    id,
  );
}


async create(
  data: {
    nombre: string;
    correo: string;
    password: string;
    rolId: number;
  },
) {
  return this.crearUsuario(
    data,
  );
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
  return this.actualizarUsuario(
    id,
    data,
  );
}

  async listarUsuarios() {
    return this.prisma.usuario.findMany({
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

      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // =========================================================
  // LISTAR ROLES
  // =========================================================

  async listarRoles() {
    return this.prisma.rol.findMany({
      select: {
        id: true,
        nombre: true,
      },

      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // =========================================================
  // OBTENER USUARIO
  // =========================================================

  async obtenerUsuario(id: number) {
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
      throw new NotFoundException('Usuario no encontrado.');
    }

    return usuario;
  }

  // =========================================================
  // CREAR USUARIO
  // =========================================================

  async crearUsuario(data: {
    nombre: string;
    correo: string;
    password: string;
    rolId: number;
  }) {
    const nombre = data.nombre.trim();

    const correo = data.correo.trim().toLowerCase();

    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio.');
    }

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio.');
    }

    if (!data.password) {
      throw new BadRequestException('La contraseña es obligatoria.');
    }

    const existente = await this.prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con este correo.');
    }

    const rol = await this.prisma.rol.findUnique({
      where: {
        id: Number(data.rolId),
      },
    });

    if (!rol) {
      throw new NotFoundException('El rol seleccionado no existe.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        passwordHash,

        rolId: Number(data.rolId),

        estado: true,
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

  // =========================================================
  // ACTUALIZAR USUARIO
  // =========================================================

  async actualizarUsuario(
    id: number,

    data: {
      nombre?: string;
      correo?: string;
      password?: string;
      rolId?: number;
      estado?: boolean;
    },
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // ---------------------------------------------------------
    // VALIDAR CORREO
    // ---------------------------------------------------------

    let correo: string | undefined;

    if (data.correo !== undefined) {
      correo = data.correo.trim().toLowerCase();

      if (!correo) {
        throw new BadRequestException('El correo no puede estar vacío.');
      }

      const correoExistente = await this.prisma.usuario.findFirst({
        where: {
          correo,

          id: {
            not: id,
          },
        },
      });

      if (correoExistente) {
        throw new ConflictException('Ya existe otro usuario con este correo.');
      }
    }

    // ---------------------------------------------------------
    // VALIDAR ROL
    // ---------------------------------------------------------

    if (data.rolId !== undefined) {
      const rol = await this.prisma.rol.findUnique({
        where: {
          id: Number(data.rolId),
        },
      });

      if (!rol) {
        throw new NotFoundException('El rol seleccionado no existe.');
      }
    }

    // ---------------------------------------------------------
    // CONTRASEÑA OPCIONAL
    // ---------------------------------------------------------

    let passwordHash: string | undefined;

    if (data.password && data.password.trim()) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    // ---------------------------------------------------------
    // ACTUALIZAR
    // ---------------------------------------------------------

    return this.prisma.usuario.update({
      where: {
        id,
      },

      data: {
        ...(data.nombre !== undefined && {
          nombre: data.nombre.trim(),
        }),

        ...(correo !== undefined && {
          correo,
        }),

        ...(passwordHash && {
          passwordHash,
        }),

        ...(data.rolId !== undefined && {
          rolId: Number(data.rolId),
        }),

        ...(data.estado !== undefined && {
          estado: data.estado,
        }),
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

  // =========================================================
  // OBTENER PERMISOS TEMPORALES DEL USUARIO
  // =========================================================

  async obtenerPermisosTemporales(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },

      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },

        permisosTemporales: {
          include: {
            permiso: true,

            asignadoPor: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },

          orderBy: {
            creadoEn: 'desc',
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol.nombre !== 'Digitador') {
      throw new BadRequestException(
        'Los permisos temporales solo pueden asignarse a usuarios con rol Digitador.',
      );
    }

    const ahora = new Date();

    const permisosBase = usuario.rol.permisos.map((rp) => ({
      id: rp.permiso.id,

      nombre: rp.permiso.nombre,
    }));

    const temporales = usuario.permisosTemporales.map((item) => ({
      id: item.id,

      permisoId: item.permisoId,

      nombre: item.permiso.nombre,

      fechaInicio: item.fechaInicio,

      fechaFin: item.fechaFin,

      estado: item.estado,

      vigente:
        item.estado && item.fechaInicio <= ahora && item.fechaFin > ahora,

      asignadoPor: item.asignadoPor,
    }));

    const permisos = await this.prisma.permiso.findMany({
      where: {
        nombre: {
          not: 'GESTIONAR_USUARIOS',
        },
      },

      orderBy: {
        nombre: 'asc',
      },
    });

    const nombresBase = new Set(permisosBase.map((permiso) => permiso.nombre));

    const disponibles = permisos.filter(
      (permiso) => !nombresBase.has(permiso.nombre),
    );

    return {
      usuario: {
        id: usuario.id,

        nombre: usuario.nombre,

        correo: usuario.correo,

        rol: usuario.rol.nombre,
      },

      permisosBase,

      disponibles,

      temporales,
    };
  }

  // =========================================================
  // ASIGNAR PERMISO TEMPORAL
  // =========================================================

  async asignarPermisoTemporal(
    usuarioId: number,
    permisoId: number,
    fechaFinTexto: string,
    asignadoPorId?: number,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },

      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!usuario.estado) {
      throw new BadRequestException(
        'No se pueden conceder permisos temporales a un usuario inactivo.',
      );
    }

    if (usuario.rol.nombre !== 'Digitador') {
      throw new BadRequestException(
        'Solo se pueden conceder permisos temporales a un Digitador.',
      );
    }

    const permiso = await this.prisma.permiso.findUnique({
      where: {
        id: permisoId,
      },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado.');
    }

    if (permiso.nombre === 'GESTIONAR_USUARIOS') {
      throw new ForbiddenException(
        'El permiso GESTIONAR_USUARIOS no puede delegarse temporalmente.',
      );
    }

    const yaEsPermisoBase = usuario.rol.permisos.some(
      (rp) => rp.permisoId === permisoId,
    );

    if (yaEsPermisoBase) {
      throw new BadRequestException(
        'El usuario ya posee este permiso mediante su rol.',
      );
    }

    const fechaFin = new Date(fechaFinTexto);

    if (Number.isNaN(fechaFin.getTime())) {
      throw new BadRequestException('La fecha de vencimiento no es válida.');
    }

    const ahora = new Date();

    if (fechaFin <= ahora) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a la fecha actual.',
      );
    }

    const existente = await this.prisma.usuarioPermisoTemporal.findFirst({
      where: {
        usuarioId,
        permisoId,
        estado: true,

        fechaFin: {
          gt: ahora,
        },
      },

      orderBy: {
        creadoEn: 'desc',
      },
    });

    if (existente) {
      return this.prisma.usuarioPermisoTemporal.update({
        where: {
          id: existente.id,
        },

        data: {
          fechaFin,

          asignadoPorId: asignadoPorId ?? existente.asignadoPorId,
        },

        include: {
          permiso: true,
        },
      });
    }

    return this.prisma.usuarioPermisoTemporal.create({
      data: {
        usuarioId,
        permisoId,

        fechaInicio: ahora,

        fechaFin,

        estado: true,

        asignadoPorId: asignadoPorId ?? null,
      },

      include: {
        permiso: true,
      },
    });
  }

  // =========================================================
  // REVOCAR PERMISO TEMPORAL
  // =========================================================

  async revocarPermisoTemporal(permisoTemporalId: number) {
    const registro = await this.prisma.usuarioPermisoTemporal.findUnique({
      where: {
        id: permisoTemporalId,
      },

      include: {
        permiso: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Permiso temporal no encontrado.');
    }

    if (!registro.estado) {
      throw new BadRequestException('El permiso temporal ya está revocado.');
    }

    return this.prisma.usuarioPermisoTemporal.update({
      where: {
        id: permisoTemporalId,
      },

      data: {
        estado: false,
      },

      include: {
        permiso: true,
      },
    });
  }
}
