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

import { InscripcionesService } from './inscripciones.service.js';

import { CreateInscripcionDto } from './dto/create-inscripcion.dto.js';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('inscripciones')
@UseGuards(JwtAuthGuard)
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) {}

  @Get()
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Get('simulacro/:simulacroId')
  findBySimulacro(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.inscripcionesService.findBySimulacro(
      simulacroId,
    );
  }

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe)
    alumnoId: number,
  ) {
    return this.inscripcionesService.findByAlumno(
      alumnoId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inscripcionesService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_INSCRIPCIONES')
  create(
    @Body() dto: CreateInscripcionDto,
  ) {
    return this.inscripcionesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_INSCRIPCIONES')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInscripcionDto,
  ) {
    return this.inscripcionesService.update(
      id,
      dto,
    );
  }

  @Patch(':id/desactivar')
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_INSCRIPCIONES')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inscripcionesService.desactivar(
      id,
    );
  }
}