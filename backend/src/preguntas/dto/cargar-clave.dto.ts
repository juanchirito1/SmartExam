import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class PreguntaClaveDto {
  @Type(() => Number)
  @IsInt({
    message: 'El número de pregunta debe ser un entero',
  })
  @Min(1, {
    message: 'El número de pregunta debe ser mayor que cero',
  })
  numero: number;

  @Type(() => Number)
  @IsInt({
    message: 'El área seleccionada no es válida',
  })
  @Min(1, {
    message: 'El área seleccionada no es válida',
  })
  areaId: number;

  @IsIn(['A', 'B', 'C', 'D', 'E'], {
    message: 'La respuesta correcta debe ser A, B, C, D o E',
  })
  respuestaCorrecta: string;
}

export class CargarClaveDto {
  @Type(() => Number)
  @IsInt({
    message: 'El simulacro seleccionado no es válido',
  })
  @Min(1, {
    message: 'El simulacro seleccionado no es válido',
  })
  simulacroId: number;

  @IsArray({
    message: 'Las preguntas deben enviarse como una lista',
  })
  @ArrayMinSize(1, {
    message: 'Debe enviarse al menos una pregunta',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => PreguntaClaveDto)
  preguntas: PreguntaClaveDto[];
}
