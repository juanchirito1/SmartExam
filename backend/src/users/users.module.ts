import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

@Module({

imports:[
  PrismaModule,
  AuthModule,
  PermissionsModule
],

controllers:[
  UsersController,
],

providers:[
  UsersService,
],

})
export class UsersModule {}