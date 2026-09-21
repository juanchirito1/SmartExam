import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateInscripcionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'La carrera seleccionada no es válida',
  })
  @Min(1, {
    message: 'La carrera seleccionada no es válida',
  })
  carreraId?: number;

  @IsOptional()
  @IsBoolean({
    message: 'El estado de la inscripción no es válido',
  })
  estado?: boolean;
}
