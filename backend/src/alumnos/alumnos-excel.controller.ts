import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

import { Permissions } from '../auth/decorators/permissions.decorator.js';

import { AlumnosExcelService } from './alumnos-excel.service.js';

@Controller('alumnos-excel')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('REGISTRAR_ALUMNOS')
export class AlumnosExcelController {
  constructor(private readonly alumnosExcelService: AlumnosExcelService) {}

  @Post('preview')
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  preview(
    @UploadedFile()
    archivo: Express.Multer.File,
  ) {
    return this.alumnosExcelService.previsualizar(archivo);
  }

  @Post('importar')
  importar(
    @Body()
    body: {
      alumnos: {
        fila: number;
        dni: string;
        nombres: string;
        apellidos: string;
        telefono: string | null;
        correo: string | null;
      }[];
    },
  ) {
    return this.alumnosExcelService.importar(body.alumnos);
  }

  @Get('exportar')
  async exportar(
    @Res()
    response: Response,
  ) {
    const archivo = await this.alumnosExcelService.exportar();

    const fecha = new Date().toISOString().slice(0, 10);

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="Alumnos_SmartExam_${fecha}.xlsx"`,
    );

    response.send(archivo);
  }
}
