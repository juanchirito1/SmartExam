import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ResultadosService } from './resultados.service.js';
import { CalificarExamenDto } from './dto/calificar-examen.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('resultados')
@UseGuards(JwtAuthGuard)
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  @Post('calificar')
  @UseGuards(PermissionsGuard)
  @Permissions('PROCESAR_FICHAS')
  calificar(
    @Body()
    dto: CalificarExamenDto,
  ) {
    return this.resultadosService.calificar(dto);
  }

  @Get('inscripcion/:inscripcionId')
  @UseGuards(PermissionsGuard)
  @Permissions('VER_RESULTADOS')
  findByInscripcion(
    @Param('inscripcionId', ParseIntPipe)
    inscripcionId: number,
  ) {
    return this.resultadosService.findByInscripcion(inscripcionId);
  }

  @Get('simulacro/:simulacroId/carrera/:carreraId')
  @UseGuards(PermissionsGuard)
  @Permissions('VER_RESULTADOS')
  rankingCarrera(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,

    @Param('carreraId', ParseIntPipe)
    carreraId: number,
  ) {
    return this.resultadosService.rankingCarrera(simulacroId, carreraId);
  }

  @Get('simulacro/:simulacroId/resumen')
  @UseGuards(PermissionsGuard)
  @Permissions('VER_RESULTADOS')
  resumenSimulacro(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.resultadosService.resumenSimulacro(simulacroId);
  }

  @Get('simulacro/:simulacroId/ranking')
  @UseGuards(PermissionsGuard)
  @Permissions('VER_RESULTADOS')
  rankingGeneral(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.resultadosService.rankingGeneral(simulacroId);
  }

  @Get('simulacro/:simulacroId/estadisticas-area')
  @UseGuards(PermissionsGuard)
  @Permissions('VER_RESULTADOS')
  estadisticasArea(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.resultadosService.estadisticasArea(simulacroId);
  }
}
