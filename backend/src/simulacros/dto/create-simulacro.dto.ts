import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateSimulacroDto {
  @Type(() => Number)
  @IsInt({
    message: 'El número de simulacro debe ser un número entero',
  })
  @Min(1, {
    message: 'El número de simulacro debe ser mayor que cero',
  })
  numero: number;

  @IsNotEmpty({
    message: 'La fecha del simulacro es obligatoria',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha del simulacro no tiene un formato válido',
    },
  )
  fecha: string;

  @Type(() => Number)
  @IsInt({
    message: 'El ciclo académico seleccionado no es válido',
  })
  @Min(1, {
    message: 'El ciclo académico seleccionado no es válido',
  })
  cicloId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El total de preguntas debe ser un número entero',
  })
  @Min(1, {
    message: 'El simulacro debe tener al menos una pregunta',
  })
  @Max(120, {
    message: 'SmartExam admite como máximo 120 preguntas',
  })
  totalPreguntas?: number;
}
