import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;

  correo: string;

  rolId: number;

  rol: string;

  iat?: number;

  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /*
        Muy importante:
        Passport rechazará JWT expirados.
      */

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    /*
      Un token válido debe contener
      al menos el identificador del usuario.
    */

    if (!payload.sub || !Number.isInteger(Number(payload.sub))) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: Number(payload.sub),

      correo: payload.correo,

      rolId: payload.rolId,

      rol: payload.rol,
    };
  }
}
