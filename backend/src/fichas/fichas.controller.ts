import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import { FichasService } from './fichas.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('fichas')
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
export class FichasController {
  constructor(
    private readonly fichasService: FichasService,
  ) {}

  @Post('procesar/:simulacroId')
  @Permissions('PROCESAR_FICHAS')
  @UseInterceptors(
    FileInterceptor('archivo'),
  )
  procesar(
    @Param(
      'simulacroId',
      ParseIntPipe,
    )
    simulacroId: number,

    @UploadedFile()
    archivo: Express.Multer.File,
  ) {
    return this.fichasService.procesar(
      simulacroId,
      archivo,
    );
  }
  
}