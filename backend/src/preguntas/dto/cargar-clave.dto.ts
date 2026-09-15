export class PreguntaClaveDto {
  numero: number;
  areaId: number;
  respuestaCorrecta: string;
}

export class CargarClaveDto {
  simulacroId: number;
  preguntas: PreguntaClaveDto[];
}