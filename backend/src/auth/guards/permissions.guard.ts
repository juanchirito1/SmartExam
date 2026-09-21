import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../prisma/prisma.service.js';

import { obtenerPermisosEfectivos } from '../utils/permisos-efectivos.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // =======================================================
    // PERMISOS REQUERIDOS POR LA RUTA
    // =======================================================

    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    /*
      Si la ruta no tiene @Permissions(),
      no hacemos ninguna validación adicional.
    */

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // =======================================================
    // USUARIO AUTENTICADO
    // =======================================================

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    /*
      Actualmente tu proyecto ya venía usando:

      request.user.id

      Lo mantenemos para no romper JwtStrategy.
    */

    const userId = Number(user.id);

    if (!userId || Number.isNaN(userId)) {
      throw new UnauthorizedException('Usuario no válido');
    }

    // =======================================================
    // PERMISOS EFECTIVOS
    // =======================================================

    const userPermissions = await obtenerPermisosEfectivos(this.prisma, userId);

    // =======================================================
    // VALIDAR TODOS LOS PERMISOS REQUERIDOS
    // =======================================================

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    return true;
  }
}
