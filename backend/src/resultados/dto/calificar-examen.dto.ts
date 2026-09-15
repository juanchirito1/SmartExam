export class RespuestaExamenDto {
  numero: number;

  // []       = blanco
  // ['A']    = una respuesta
  // ['A','C']= doble marca
  marcas: string[];
}

export class CalificarExamenDto {
  inscripcionId: number;
  respuestas: RespuestaExamenDto[];
}