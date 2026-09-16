import {
  Controller,
  Get,
  UseGuards,
  ParseIntPipe,
  Param,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  resumen() {
    return this.dashboardService.resumen();
  }
  @Get('ranking/:simulacroId')
  ranking(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.dashboardService.ranking(simulacroId);
  }
  @Get('estadisticas/:simulacroId')
  estadisticas(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,
  ) {
    return this.dashboardService.estadisticas(simulacroId);
  }
}
