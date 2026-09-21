import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

import { Permissions } from '../auth/decorators/permissions.decorator.js';


@Controller('users')
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
@Permissions(
  'GESTIONAR_USUARIOS',
)
export class UsersController {

  constructor(
    private readonly usersService:
      UsersService,
  ) {}


  // =========================================================
  // LISTAR USUARIOS
  // =========================================================

  @Get()
  findAll() {
    return this.usersService
      .findAll();
  }


  // =========================================================
  // LISTAR ROLES
  // IMPORTANTE: ANTES DE :id
  // =========================================================

  @Get('roles')
  findRoles() {
    return this.usersService
      .findRoles();
  }


  // =========================================================
  // CONSULTAR PERMISOS TEMPORALES
  // =========================================================

  @Get(':id/permisos-temporales')
  obtenerPermisosTemporales(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usersService
      .obtenerPermisosTemporales(
        id,
      );
  }


  // =========================================================
  // ASIGNAR PERMISO TEMPORAL
  // =========================================================

  @Post(':id/permisos-temporales')
  asignarPermisoTemporal(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      permisoId: number;
      fechaFin: string;
    },
  ) {
    return this.usersService
      .asignarPermisoTemporal(
        id,
        Number(
          body.permisoId,
        ),
        body.fechaFin,
      );
  }


  // =========================================================
  // REVOCAR PERMISO TEMPORAL
  // =========================================================

  @Patch(
    'permisos-temporales/:id/revocar',
  )
  revocarPermisoTemporal(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usersService
      .revocarPermisoTemporal(
        id,
      );
  }


  // =========================================================
  // OBTENER USUARIO
  // =========================================================

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usersService
      .findOne(
        id,
      );
  }


  // =========================================================
  // CREAR USUARIO
  // =========================================================

  @Post()
  create(
    @Body()
    body: {
      nombre: string;
      correo: string;
      password: string;
      rolId: number;
    },
  ) {
    return this.usersService
      .create(
        body,
      );
  }


  // =========================================================
  // ACTUALIZAR USUARIO
  // =========================================================

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      nombre?: string;
      correo?: string;
      password?: string;
      rolId?: number;
      estado?: boolean;
    },
  ) {
    return this.usersService
      .update(
        id,
        body,
      );
  }

}