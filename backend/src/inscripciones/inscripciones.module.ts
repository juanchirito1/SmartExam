import { Module } from '@nestjs/common';

import { InscripcionesService } from './inscripciones.service.js';
import { InscripcionesController } from './inscripciones.controller.js';

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
    InscripcionesController,
  ],

  providers: [
    InscripcionesService,
  ],
})
export class InscripcionesModule {}