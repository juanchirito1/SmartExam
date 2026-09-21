import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCicloDto {
  @IsString({
    message: 'El nombre del ciclo debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre del ciclo es obligatorio',
  })
  @MaxLength(20, {
    message: 'El nombre del ciclo no puede superar los 20 caracteres',
  })
  @Matches(/^\d{4}-(I|II)$/, {
    message:
      'El ciclo debe tener el formato AAAA-I o AAAA-II, por ejemplo 2027-I',
  })
  nombre: string;
}
