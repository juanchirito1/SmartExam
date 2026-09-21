import {
  BadRequestException,
  Controller,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { FichasService } from './fichas.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { PermissionsGuard } from '../auth/guards/permissions.guard.js';

import { Permissions } from '../auth/decorators/permissions.decorator.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Controller('fichas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Post('procesar/:simulacroId')
  @Permissions('PROCESAR_FICHAS')
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: {
        /*
            Máximo 10 MB por imagen.
          */

        fileSize: MAX_FILE_SIZE,

        /*
            Solo un archivo.
          */

        files: 1,
      },

      /*
          Primera barrera:
          MIME declarado por el navegador.
        */

      fileFilter: (_request, file, callback) => {
        const tiposPermitidos = ['image/jpeg', 'image/png'];

        if (!tiposPermitidos.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Solo se permiten imágenes JPG, JPEG o PNG.',
            ),
            false,
          );

          return;
        }

        callback(null, true);
      },
    }),
  )
  procesar(
    @Param('simulacroId', ParseIntPipe)
    simulacroId: number,

    @UploadedFile(
      new ParseFilePipeBuilder()

        /*
          Segunda validación del tamaño.
        */

        .addMaxSizeValidator({
          maxSize: MAX_FILE_SIZE,

          message: 'La imagen no puede superar los 10 MB.',
        })

        /*
          Segunda validación del tipo.
        */

        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })

        .build({
          fileIsRequired: true,

          errorHttpStatusCode: 400,
        }),
    )
    archivo: Express.Multer.File,
  ) {
    return this.fichasService.procesar(simulacroId, archivo);
  }
}
