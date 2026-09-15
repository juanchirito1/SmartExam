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

import { SimulacrosService } from './simulacros.service.js';
import { CreateSimulacroDto } from './dto/create-simulacro.dto.js';
import { UpdateSimulacroDto } from './dto/update-simulacro.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('simulacros')
@UseGuards(JwtAuthGuard)
export class SimulacrosController {
  constructor(
    private readonly simulacrosService: SimulacrosService,
  ) {}

  @Get()
  findAll() {
    return this.simulacrosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.simulacrosService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  create(
    @Body() dto: CreateSimulacroDto,
  ) {
    return this.simulacrosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSimulacroDto,
  ) {
    return this.simulacrosService.update(
      id,
      dto,
    );
  }
}