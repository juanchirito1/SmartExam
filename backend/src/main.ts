import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';


async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule
    );


  const config =
    new DocumentBuilder()
      .setTitle('SmartExam API')
      .setDescription(
        'API sistema de simulacros y fichas ópticas'
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();


  const document =
    SwaggerModule.createDocument(
      app,
      config
    );


  SwaggerModule.setup(
    'docs',
    app,
    document
  );


  await app.listen(
    3000
  );

}

bootstrap();