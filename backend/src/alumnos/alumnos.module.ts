import { Module } from '@nestjs/common';

import { AlumnosService } from './alumnos.service.js';
import { AlumnosController } from './alumnos.controller.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

import {
  AlumnosExcelController,
} from './alumnos-excel.controller.js';

import {
  AlumnosExcelService,
} from './alumnos-excel.service.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PermissionsModule,
  ],

  controllers: [
    AlumnosController,
    AlumnosExcelController,
  ],

  providers: [
    AlumnosService,
    AlumnosExcelService,
  ],
})
export class AlumnosModule {}