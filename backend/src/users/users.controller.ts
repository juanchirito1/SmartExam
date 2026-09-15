import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

@Get()

@UseGuards(
 JwtAuthGuard,
 PermissionsGuard
)

@Permissions(
 'GESTIONAR_USUARIOS'
)
  findAll() {
    return this.usersService.findAll();
  }

}