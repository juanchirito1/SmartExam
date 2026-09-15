import { Module } from '@nestjs/common';

import { PreguntasController } from './preguntas.controller.js';
import { PreguntasService } from './preguntas.service.js';

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
    PreguntasController,
  ],

  providers: [
    PreguntasService,
  ],

  exports: [
    PreguntasService,
  ],
})
export class PreguntasModule {}