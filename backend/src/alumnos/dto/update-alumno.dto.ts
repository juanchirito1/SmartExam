import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateAlumnoDto {
  @IsOptional()
  @IsString()
  @Length(8, 8, {
    message: 'El DNI debe tener exactamente 8 caracteres',
  })
  dni?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @ValidateIf((_obj, valor) => valor !== '')
  @IsEmail({}, {
    message: 'El correo no tiene un formato válido',
  })
  correo?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}