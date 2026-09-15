import { Module } from '@nestjs/common';

import { SimulacrosService } from './simulacros.service.js';
import { SimulacrosController } from './simulacros.controller.js';

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
    SimulacrosController,
  ],
  providers: [
    SimulacrosService,
  ],
})
export class SimulacrosModule {}