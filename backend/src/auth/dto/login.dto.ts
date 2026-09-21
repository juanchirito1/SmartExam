import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';


export class LoginDto {

  @IsEmail(
    {},
    {
      message:
        'El correo electrónico no es válido',
    },
  )
  @MaxLength(
    150,
    {
      message:
        'El correo electrónico es demasiado largo',
    },
  )
  correo!: string;


  @IsString({
    message:
      'La contraseña debe ser una cadena de texto',
  })
  @MinLength(
    8,
    {
      message:
        'La contraseña debe tener al menos 8 caracteres',
    },
  )
  @MaxLength(
    100,
    {
      message:
        'La contraseña es demasiado larga',
    },
  )
  password!: string;

}