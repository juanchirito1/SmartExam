import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateCicloDto {
  @IsOptional()
  @IsString({
    message: 'El nombre del ciclo debe ser texto',
  })
  @MaxLength(20, {
    message: 'El nombre del ciclo no puede superar los 20 caracteres',
  })
  @Matches(/^\d{4}-(I|II)$/, {
    message:
      'El ciclo debe tener el formato AAAA-I o AAAA-II, por ejemplo 2027-I',
  })
  nombre?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado del ciclo debe ser verdadero o falso',
  })
  estado?: boolean;
}
