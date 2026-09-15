import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PreguntasService } from './preguntas.service.js';

import { CreatePreguntaDto } from './dto/create-pregunta.dto.js';
import { UpdatePreguntaDto } from './dto/update-pregunta.dto.js';
import { CargarClaveDto } from './dto/cargar-clave.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('preguntas')
@UseGuards(JwtAuthGuard)
export class PreguntasController {
  constructor(
    private readonly preguntasService: PreguntasService,
  ) {}

  @Get('simulacro/:simulacroId')
  findBySimulacro(
    @Param(
      'simulacroId',
      ParseIntPipe,
    )
    simulacroId: number,
  ) {
    return this.preguntasService
      .findBySimulacro(
        simulacroId,
      );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.preguntasService
      .findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  create(
    @Body()
    dto: CreatePreguntaDto,
  ) {
    return this.preguntasService
      .create(dto);
  }

  @Post('cargar-clave')
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  cargarClave(
    @Body()
    dto: CargarClaveDto,
  ) {
    return this.preguntasService
      .cargarClaveCompleta(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdatePreguntaDto,
  ) {
    return this.preguntasService
      .update(id, dto);
  }
}