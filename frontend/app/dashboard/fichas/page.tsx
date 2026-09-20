"use client";

import { ChangeEvent, useEffect, useState } from "react";

import {
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  RotateCcw,
  ScanLine,
} from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Simulacro {
  id: number;
  numero: number;
  fecha: string;
  estado: string;
  totalPreguntas: number;

  ciclo: {
    id: number;
    nombre: string;
  };
}

interface ResultadoProcesamiento {
  mensaje: string;

  lecturaOmr: {
    dni: string;
    totalRespuestas: number;
    unicas: number;
    blancas: number;
    dobles: number;
  };

  alumno: {
    id: number;
    dni: string;
    nombre: string;
  };

  inscripcion: {
    id: number;
    carrera: string;
    grupo: string;
  };

  resultado: {
    resultadoId: number;

    alumno: {
      id: number;
      dni: string;
      nombre: string;
    };

    carrera: string;
    grupo: string;
    simulacroId: number;

    correctas: number;
    incorrectas: number;
    blancas: number;
    dobles: number;

    puntajeTotal: number;
    puntajeMaximo: number;
  };
}

export default function FichasPage() {
  const [simulacros, setSimulacros] = useState<Simulacro[]>([]);

  const [simulacroId, setSimulacroId] = useState("");

  const [archivo, setArchivo] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  const [procesando, setProcesando] = useState(false);

  const [cargando, setCargando] = useState(true);

  const [resultado, setResultado] = useState<ResultadoProcesamiento | null>(
    null,
  );

  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarSimulacros() {
      try {
        const response = await api.get("/simulacros");

        const data: Simulacro[] = response.data;

        setSimulacros(data);

        const activo = data.find((simulacro) => simulacro.estado === "ACTIVO");

        if (activo) {
          setSimulacroId(String(activo.id));
        }
      } catch (error) {
        console.error("Error cargando simulacros", error);
      } finally {
        setCargando(false);
      }
    }

    cargarSimulacros();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function seleccionarArchivo(event: ChangeEvent<HTMLInputElement>) {
    const seleccionado = event.target.files?.[0];

    if (!seleccionado) {
      return;
    }

    if (!seleccionado.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");

      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setArchivo(seleccionado);

    setPreview(URL.createObjectURL(seleccionado));

    setResultado(null);

    setError("");
  }

  async function procesarFicha() {
    if (!simulacroId) {
      setError("Selecciona un simulacro.");

      return;
    }

    if (!archivo) {
      setError("Selecciona o captura una imagen de la ficha.");

      return;
    }

    try {
      setProcesando(true);

      setError("");

      setResultado(null);

      const formData = new FormData();

      formData.append("archivo", archivo);

      const response = await api.post(
        `/fichas/procesar/${simulacroId}`,
        formData,
      );

      setResultado(response.data);
    } catch (error: any) {
      console.error("Error procesando ficha", error);

      const data = error.response?.data;

      let mensaje = "No se pudo procesar la ficha.";

      if (typeof data?.message === "string") {
        mensaje = data.message;
      } else if (Array.isArray(data?.message)) {
        mensaje = data.message.join(", ");
      } else if (data?.mensaje) {
        mensaje = data.mensaje;

        if (Array.isArray(data.errores) && data.errores.length > 0) {
          mensaje += `: ${data.errores.join(", ")}`;
        }
      }

      setError(mensaje);
    } finally {
      setProcesando(false);
    }
  }

  function limpiar() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setArchivo(null);

    setPreview("");

    setResultado(null);

    setError("");
  }

  if (cargando) {
    return <div className="p-10">Cargando módulo OMR...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Procesamiento de Fichas OMR</h1>

        <p className="text-sm text-muted-foreground">
          Captura o selecciona la hoja de respuestas para procesarla
          automáticamente.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* PANEL DE CAPTURA */}

        <div className="space-y-5 rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />

            <h2 className="font-semibold">Ficha óptica</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="simulacro">Simulacro</Label>

            <select
              id="simulacro"
              value={simulacroId}
              onChange={(e) => setSimulacroId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Seleccione un simulacro</option>

              {simulacros.map((simulacro) => (
                <option key={simulacro.id} value={simulacro.id}>
                  Simulacro {simulacro.numero}
                  {" - "}
                  {simulacro.ciclo.nombre}
                  {" - "}
                  {simulacro.estado}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="archivo">Imagen de la ficha</Label>

            <Input
              id="archivo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={seleccionarArchivo}
            />

            <p className="text-xs text-muted-foreground">
              En un teléfono se utilizará preferentemente la cámara posterior.
            </p>
          </div>

          {preview ? (
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={preview}
                alt="Vista previa de ficha OMR"
                className="max-h-[500px] w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <Camera className="mb-3 h-10 w-10" />

              <p className="text-sm">Aún no se ha seleccionado una ficha.</p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={procesarFicha}
              disabled={procesando || !archivo || !simulacroId}
            >
              {procesando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="mr-2 h-4 w-4" />
              )}

              {procesando ? "Procesando ficha..." : "Procesar ficha"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={limpiar}
              disabled={procesando}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>

        {/* PANEL DE RESULTADO */}

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <FileImage className="h-5 w-5" />

            <h2 className="font-semibold">Resultado del procesamiento</h2>
          </div>

          {!resultado ? (
            <div className="flex min-h-72 items-center justify-center text-center text-sm text-muted-foreground">
              El resultado aparecerá aquí después de procesar una ficha.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />

                <span className="font-medium">
                  Ficha procesada correctamente
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Dato label="Alumno" value={resultado.alumno.nombre} />

                <Dato label="DNI" value={resultado.alumno.dni} />

                <Dato label="Carrera" value={resultado.inscripcion.carrera} />

                <Dato label="Grupo" value={resultado.inscripcion.grupo} />
              </div>

              <div className="border-t pt-5">
                <p className="mb-4 text-sm font-medium">Lectura OMR</p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Dato
                    label="Respuestas"
                    value={resultado.lecturaOmr.totalRespuestas}
                  />

                  <Dato label="Únicas" value={resultado.lecturaOmr.unicas} />

                  <Dato label="Blancas" value={resultado.lecturaOmr.blancas} />

                  <Dato label="Dobles" value={resultado.lecturaOmr.dobles} />
                </div>
              </div>

              <div className="border-t pt-5">
                <p className="mb-4 text-sm font-medium">Calificación</p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Dato
                    label="Correctas"
                    value={resultado.resultado.correctas}
                  />

                  <Dato
                    label="Incorrectas"
                    value={resultado.resultado.incorrectas}
                  />

                  <Dato label="Blancas" value={resultado.resultado.blancas} />

                  <Dato label="Dobles" value={resultado.resultado.dobles} />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground">
                  Puntaje obtenido
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {resultado.resultado.puntajeTotal}

                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    / {resultado.resultado.puntajeMaximo}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dato({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
