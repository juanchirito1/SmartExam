import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateSimulacroDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El número de simulacro debe ser un número entero',
  })
  @Min(1, {
    message: 'El número de simulacro debe ser mayor que cero',
  })
  numero?: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha del simulacro no tiene un formato válido',
    },
  )
  fecha?: string;

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

  @IsOptional()
  @IsIn(['BORRADOR', 'ACTIVO', 'FINALIZADO'], {
    message: 'El estado debe ser BORRADOR, ACTIVO o FINALIZADO',
  })
  estado?: string;
}
