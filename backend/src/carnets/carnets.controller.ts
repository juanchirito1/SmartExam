import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { CarnetsService } from './carnets.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('carnets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CarnetsController {
  constructor(private readonly carnetsService: CarnetsService) {}

  // =========================================================
  // DATOS DEL CARNET
  // =========================================================

  @Get('inscripcion/:inscripcionId/datos')
  @Permissions('GENERAR_CARNETS')
  obtenerDatos(
    @Param('inscripcionId', ParseIntPipe)
    inscripcionId: number,
  ) {
    return this.carnetsService.obtenerDatosCarnet(inscripcionId);
  }

  // =========================================================
  // PDF
  // =========================================================

  @Get('inscripcion/:inscripcionId/pdf')
  @Permissions('GENERAR_CARNETS')
  async generarPdf(
    @Param('inscripcionId', ParseIntPipe)
    inscripcionId: number,

    @Res()
    res: Response,
  ) {
    const pdf = await this.carnetsService.generarPdf(inscripcionId);

    const nombreArchivo = `carnet-${inscripcionId}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `inline; filename="${nombreArchivo}"`,

      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  // =========================================================
  // ENVIAR POR CORREO
  // =========================================================

  @Post('inscripcion/:inscripcionId/enviar-correo')
  @Permissions('GENERAR_CARNETS', 'ENVIAR_CARNET_CORREO')
  enviarCorreo(
    @Param('inscripcionId', ParseIntPipe)
    inscripcionId: number,
  ) {
    return this.carnetsService.enviarCarnetPorCorreo(inscripcionId);
  }

  @Get('inscripcion/:inscripcionId/whatsapp')
  @Permissions('GENERAR_CARNETS', 'ENVIAR_CARNET_WHATSAPP')
  obtenerWhatsApp(
    @Param('inscripcionId', ParseIntPipe)
    inscripcionId: number,
  ) {
    return this.carnetsService.obtenerDatosWhatsApp(inscripcionId);
  }
}
