import { Module } from '@nestjs/common';

import { CarrerasService } from './carreras.service.js';
import { CarrerasController } from './carreras.controller.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PermissionsModule,
  ],

  providers: [
    CarrerasService,
  ],

  controllers: [
    CarrerasController,
  ],
})
export class CarrerasModule {}