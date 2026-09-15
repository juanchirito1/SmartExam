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

import { CarrerasService } from './carreras.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('carreras')
@UseGuards(JwtAuthGuard)
export class CarrerasController {
  constructor(
    private readonly carrerasService: CarrerasService,
  ) {}

  @Get()
  findAll() {
    return this.carrerasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carrerasService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_CARRERAS')
  create(
    @Body() dto: CreateCarreraDto,
  ) {
    return this.carrerasService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_CARRERAS')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarreraDto,
  ) {
    return this.carrerasService.update(
      id,
      dto,
    );
  }

  @Patch(':id/desactivar')
  @UseGuards(PermissionsGuard)
  @Permissions('GESTIONAR_CARRERAS')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carrerasService.desactivar(
      id,
    );
  }
}