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

import { CiclosService } from './ciclos.service.js';
import { CreateCicloDto } from './dto/create-ciclo.dto.js';
import { UpdateCicloDto } from './dto/update-ciclo.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class CiclosController {
  constructor(
    private readonly ciclosService: CiclosService,
  ) {}

  @Get()
  findAll() {
    return this.ciclosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ciclosService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  create(
    @Body() dto: CreateCicloDto,
  ) {
    return this.ciclosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('CREAR_SIMULACRO')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCicloDto,
  ) {
    return this.ciclosService.update(id, dto);
  }
}