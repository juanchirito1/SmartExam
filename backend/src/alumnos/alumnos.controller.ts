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

import { AlumnosService } from './alumnos.service.js';

import { CreateAlumnoDto } from './dto/create-alumno.dto.js';
import { UpdateAlumnoDto } from './dto/update-alumno.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('alumnos')
@UseGuards(JwtAuthGuard)
export class AlumnosController {
  constructor(
    private readonly alumnosService: AlumnosService,
  ) {}

  @Get()
  findAll() {
    return this.alumnosService.findAll();
  }

  @Get('dni/:dni')
  findByDni(
    @Param('dni') dni: string,
  ) {
    return this.alumnosService.findByDni(dni);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alumnosService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('REGISTRAR_ALUMNOS')
  create(
    @Body() dto: CreateAlumnoDto,
  ) {
    return this.alumnosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('REGISTRAR_ALUMNOS')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlumnoDto,
  ) {
    return this.alumnosService.update(
      id,
      dto,
    );
  }

  @Patch(':id/desactivar')
  @UseGuards(PermissionsGuard)
  @Permissions('REGISTRAR_ALUMNOS')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alumnosService.desactivar(id);
  }

  @Patch(':id/reactivar')
  @UseGuards(PermissionsGuard)
  @Permissions('REGISTRAR_ALUMNOS')
  reactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alumnosService.reactivar(id);
  }
}