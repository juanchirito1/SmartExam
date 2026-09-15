import { Module } from '@nestjs/common';
import { CiclosService } from './ciclos.service.js';
import { CiclosController } from './ciclos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PermissionsModule,
  ],

  controllers: [
    CiclosController,
  ],

  providers: [
    CiclosService,
  ],
})
export class CiclosModule {}
