import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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


@Module({

  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    UsersModule,

    AuthModule,

    PermissionsModule,

    CarrerasModule,

    AlumnosModule,

    CiclosModule,

    SimulacrosModule,

    InscripcionesModule,

    CarnetsModule,

    PreguntasModule,

    ResultadosModule,

    FichasModule,

  ],

})
export class AppModule {}