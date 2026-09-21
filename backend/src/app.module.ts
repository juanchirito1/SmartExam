import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module.js';

import { UsersModule } from './users/users.module.js';

import { AuthModule } from './auth/auth.module.js';

import { PermissionsModule } from './permissions/permissions.module.js';

import { CarrerasModule } from './carreras/carreras.module.js';

import { AlumnosModule } from './alumnos/alumnos.module.js';

import { CiclosModule } from './ciclos/ciclos.module.js';

import { SimulacrosModule } from './simulacros/simulacros.module.js';

import { InscripcionesModule } from './inscripciones/inscripciones.module.js';

import { CarnetsModule } from './carnets/carnets.module.js';

import { PreguntasModule } from './preguntas/preguntas.module.js';

import { ResultadosModule } from './resultados/resultados.module.js';

import { FichasModule } from './fichas/fichas.module.js';

import { DashboardModule } from './dashboard/dashboard.module.js';

import { AreasModule } from './areas/areas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      cache: true,

      expandVariables: true,
    }),

    /*
      Límite general bastante permisivo.

      Evita abusos evidentes sin afectar
      el uso normal de SmartExam.
    */

    ThrottlerModule.forRoot([
      {
        name: 'default',

        ttl: 60_000,

        limit: 100,
      },
    ]),

    PrismaModule,

    AuthModule,

    PermissionsModule,

    UsersModule,

    CarrerasModule,

    AlumnosModule,

    CiclosModule,

    SimulacrosModule,

    InscripcionesModule,

    CarnetsModule,

    PreguntasModule,

    ResultadosModule,

    FichasModule,

    DashboardModule,

    AreasModule,
  ],

  providers: [
    /*
      Rate limiting aplicado globalmente.
    */

    {
      provide: APP_GUARD,

      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
