import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service.js';

import { LoginDto } from './dto/login.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

interface AuthenticatedRequest {
  user: {
    id: number;

    correo: string;

    rolId: number;

    rol: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================================================
  // LOGIN
  // =========================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)

  /*
    Máximo 5 intentos por minuto.

    Esto reduce ataques básicos
    de fuerza bruta.
  */
  @Throttle({
    default: {
      limit: 5,

      ttl: 60_000,
    },
  })
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto.correo, loginDto.password);
  }

  // =========================================================
  // SESIÓN ACTUAL
  // =========================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.authService.me(request.user.id);
  }
}
