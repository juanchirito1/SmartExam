import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { CarnetsService } from './carnets.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('carnets')
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
@Permissions('GENERAR_CARNETS')
export class CarnetsController {
  constructor(
    private readonly carnetsService: CarnetsService,
  ) {}

  // ================================================
  // Vista previa de los datos
  // ================================================

  @Get('inscripcion/:inscripcionId/datos')
  obtenerDatos(
    @Param(
      'inscripcionId',
      ParseIntPipe,
    )
    inscripcionId: number,
  ) {
    return this.carnetsService
      .obtenerDatosCarnet(
        inscripcionId,
      );
  }

  // ================================================
  // PDF
  // ================================================

  @Get('inscripcion/:inscripcionId/pdf')
  async generarPdf(
    @Param(
      'inscripcionId',
      ParseIntPipe,
    )
    inscripcionId: number,

    @Res()
    res: Response,
  ) {
    const pdf =
      await this.carnetsService
        .generarPdf(
          inscripcionId,
        );

    const nombreArchivo =
      `carnet-${inscripcionId}.pdf`;

    res.set({
      'Content-Type':
        'application/pdf',

      'Content-Disposition':
        `inline; filename="${nombreArchivo}"`,

      'Content-Length':
        pdf.length,
    });

    res.end(pdf);
  }
}