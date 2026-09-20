import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(correo: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        correo,
      },

      include: {
        rol: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );

    if (!passwordCorrecta) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.jwtService.sign({
      sub: usuario.id,

      correo: usuario.correo,

      rolId: usuario.rol.id,

      rol: usuario.rol.nombre,
    });

    return {
      accessToken: token,

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre,
      },
    };
  }

  async me(userId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: userId,
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

            permisos: {
              select: {
                permiso: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return {
      id: usuario.id,

      nombre: usuario.nombre,

      correo: usuario.correo,

      rol: {
        id: usuario.rol.id,
        nombre: usuario.rol.nombre,
      },

      permisos: usuario.rol.permisos.map((item) => item.permiso.nombre),
    };
  }
}
