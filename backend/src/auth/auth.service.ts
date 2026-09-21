import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service.js';

import { obtenerPermisosEfectivos } from './utils/permisos-efectivos.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================================================
  // LOGIN
  // =========================================================

  async login(correo: string, password: string) {
    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        correo: correoNormalizado,
      },

      include: {
        rol: true,
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );

    if (!passwordCorrecta) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.jwtService.sign(
      {
        sub: usuario.id,

        correo: usuario.correo,

        rolId: usuario.rol.id,

        rol: usuario.rol.nombre,
      },

      {
        /*
        8 horas.

        Un turno de trabajo completo,
        pero el token no queda válido
        indefinidamente.
      */

        expiresIn: 8 * 60 * 60,
      },
    );

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

  // =========================================================
  // USUARIO ACTUAL
  // =========================================================

  async me(userId: number) {
    /*
      Aquí solamente necesitamos
      los datos principales y el rol.

      Los permisos se obtienen después
      mediante obtenerPermisosEfectivos().
    */

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
          },
        },
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    /*
      Permisos efectivos =
      permisos del rol
      +
      permisos temporales vigentes
    */

    const permisos = await obtenerPermisosEfectivos(this.prisma, usuario.id);

    return {
      id: usuario.id,

      nombre: usuario.nombre,

      correo: usuario.correo,

      rol: {
        id: usuario.rol.id,

        nombre: usuario.rol.nombre,
      },

      permisos,
    };
  }
}
