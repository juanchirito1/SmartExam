import {
  Module,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  AuthService,
} from './auth.service.js';

import {
  AuthController,
} from './auth.controller.js';

import {
  PrismaModule,
} from '../prisma/prisma.module.js';

import {
  PermissionsModule,
} from '../permissions/permissions.module.js';

import {
  JwtStrategy,
} from './strategies/jwt.strategy.js';

import {
  JwtAuthGuard,
} from './guards/jwt-auth.guard.js';

import {
  PermissionsGuard,
} from './guards/permissions.guard.js';


@Module({

  imports: [

    PrismaModule,

    PermissionsModule,


    PassportModule.register({

      defaultStrategy:
        'jwt',

    }),


    JwtModule.registerAsync({

      inject: [
        ConfigService,
      ],


      useFactory: (
        configService:
          ConfigService,
      ) => ({

        secret:
          configService
            .getOrThrow<string>(
              'JWT_SECRET',
            ),


        signOptions: {

          /*
            Duración máxima de una sesión
            normal de SmartExam.
          */

          expiresIn:
            8 * 60 * 60,

        },

      }),

    }),

  ],


  controllers: [

    AuthController,

  ],


  providers: [

    AuthService,

    JwtStrategy,

    JwtAuthGuard,

    PermissionsGuard,

  ],


  exports: [

    JwtModule,

    PassportModule,

    JwtAuthGuard,

    PermissionsGuard,

  ],

})
export class AuthModule {}