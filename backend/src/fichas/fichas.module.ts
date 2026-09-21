import { Module } from '@nestjs/common';

import { FichasController } from './fichas.controller.js';

import { FichasService } from './fichas.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

import { AuthModule } from '../auth/auth.module.js';

import { PermissionsModule } from '../permissions/permissions.module.js';

import { ResultadosModule } from '../resultados/resultados.module.js';

@Module({
  imports: [PrismaModule, AuthModule, PermissionsModule, ResultadosModule],

  controllers: [FichasController],

  providers: [FichasService],
})
export class FichasModule {}
