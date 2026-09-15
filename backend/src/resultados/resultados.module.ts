import { Module } from '@nestjs/common';

import { ResultadosController } from './resultados.controller.js';
import { ResultadosService } from './resultados.service.js';

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
    ResultadosController,
  ],

  providers: [
    ResultadosService,
  ],

  exports: [
    ResultadosService,
  ],
})
export class ResultadosModule {}