import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty({
    message: 'El DNI es obligatorio',
  })
  @Matches(/^\d{8}$/, {
    message: 'El DNI debe contener exactamente 8 dígitos',
  })
  dni: string;

  @IsString()
  @IsNotEmpty({
    message: 'Los nombres son obligatorios',
  })
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty({
    message: 'Los apellidos son obligatorios',
  })
  @MaxLength(100)
  apellidos: string;

  @ValidateIf(
    (_obj, valor) => valor !== undefined && valor !== null && valor !== '',
  )
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ValidateIf(
    (_obj, valor) => valor !== undefined && valor !== null && valor !== '',
  )
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido',
    },
  )
  @MaxLength(150)
  correo?: string;
}
