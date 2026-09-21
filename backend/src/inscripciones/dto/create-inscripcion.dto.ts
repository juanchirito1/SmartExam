import { IsInt, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class CreateInscripcionDto {
  @Type(() => Number)
  @IsInt({
    message: 'El alumno seleccionado no es válido',
  })
  @Min(1, {
    message: 'El alumno seleccionado no es válido',
  })
  alumnoId: number;

  @Type(() => Number)
  @IsInt({
    message: 'El simulacro seleccionado no es válido',
  })
  @Min(1, {
    message: 'El simulacro seleccionado no es válido',
  })
  simulacroId: number;

  @Type(() => Number)
  @IsInt({
    message: 'La carrera seleccionada no es válida',
  })
  @Min(1, {
    message: 'La carrera seleccionada no es válida',
  })
  carreraId: number;
}
