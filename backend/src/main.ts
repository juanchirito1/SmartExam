import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  ConfigService,
} from '@nestjs/config';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import {
  AppModule,
} from './app.module.js';


async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );


  const configService =
    app.get(
      ConfigService,
    );


  // =========================================================
  // VALIDACIÓN GLOBAL
  // =========================================================

  app.useGlobalPipes(
    new ValidationPipe({

      /*
        Solo acepta propiedades
        definidas en los DTO.
      */
      whitelist: true,


      /*
        Si envían propiedades adicionales,
        devuelve 400 en lugar de ignorarlas.
      */
      forbidNonWhitelisted: true,


      /*
        Permite transformar automáticamente
        parámetros y valores cuando corresponde.
      */
      transform: true,


      transformOptions: {
        enableImplicitConversion:
          true,
      },

    }),
  );


  // =========================================================
  // CORS
  // =========================================================

  const frontendUrls =
    (
      configService.get<string>(
        'FRONTEND_URL',
      ) ??
      'http://localhost:3001'
    )
      .split(',')
      .map(
        (url) =>
          url.trim(),
      )
      .filter(
        Boolean,
      );


  app.enableCors({

    /*
      En desarrollo será:
      http://localhost:3001

      En producción podremos colocar
      el dominio real desde .env.
    */
    origin:
      frontendUrls,


    credentials:
      true,


    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],


    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

  });


  // =========================================================
  // SWAGGER
  // =========================================================

  const nodeEnv =
    configService.get<string>(
      'NODE_ENV',
    ) ??
    'development';


  const swaggerEnabled =
    nodeEnv !==
      'production' ||
    configService.get<string>(
      'SWAGGER_ENABLED',
    ) ===
      'true';


  if (swaggerEnabled) {

    const swaggerConfig =
      new DocumentBuilder()
        .setTitle(
          'SmartExam API',
        )
        .setDescription(
          'API del sistema de simulacros y procesamiento de fichas ópticas',
        )
        .setVersion(
          '1.0',
        )
        .addBearerAuth()
        .build();


    const document =
      SwaggerModule.createDocument(
        app,
        swaggerConfig,
      );


    SwaggerModule.setup(
      'docs',
      app,
      document,
    );

  }


  // =========================================================
  // CIERRE CONTROLADO
  // =========================================================

  app.enableShutdownHooks();


  // =========================================================
  // PUERTO
  // =========================================================

  const port =
    configService.get<number>(
      'PORT',
    ) ??
    3000;


  await app.listen(
    port,
  );


  console.log(
    `SmartExam API ejecutándose en puerto ${port}`,
  );

}


bootstrap().catch(
  (error) => {

    console.error(
      'No se pudo iniciar SmartExam API:',
      error,
    );

    process.exit(1);

  },
);