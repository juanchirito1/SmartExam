import { Module } from '@nestjs/common';

import { CarnetsController } from './carnets.controller.js';
import { CarnetsService } from './carnets.service.js';

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
    CarnetsController,
  ],

  providers: [
    CarnetsService,
  ],

  exports: [
    CarnetsService,
  ],
})
export class CarnetsModule {}