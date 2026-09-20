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
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('GESTIONAR_USUARIOS')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('roles')
  findRoles() {
    return this.usersService.findRoles();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findOne(id);
  }

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
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
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
    return this.usersService.update(id, body);
  }
}
