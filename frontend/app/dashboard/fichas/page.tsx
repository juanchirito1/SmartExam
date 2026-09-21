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
    <div className="space-y-7">
      {/* ENCABEZADO */}

      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-violet-50
          text-violet-600
        "
        >
          <ScanLine className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-violet-600">
            Procesamiento óptico
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Fichas OMR
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Captura y procesa hojas de respuestas mediante reconocimiento
            óptico.
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* ESCÁNER */}

        <div
          className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
        >
          {/* HEADER */}

          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
              "
              >
                <Camera className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Captura de ficha
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Selecciona el simulacro y carga la hoja de respuestas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* SIMULACRO */}

            <div className="space-y-2">
              <Label htmlFor="simulacro">Simulacro</Label>

              <select
                id="simulacro"
                value={simulacroId}
                onChange={(e) => setSimulacroId(e.target.value)}
                className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-700
                outline-none
                focus:border-blue-500
              "
              >
                <option value="">Seleccione un simulacro</option>

                {simulacros.map((simulacro) => (
                  <option key={simulacro.id} value={simulacro.id}>
                    Simulacro {simulacro.numero}
                    {" · "}
                    {simulacro.ciclo.nombre}
                    {" · "}
                    {simulacro.estado}
                  </option>
                ))}
              </select>
            </div>

            {/* ARCHIVO */}

            <div className="space-y-2">
              <Label htmlFor="archivo">Imagen de la ficha</Label>

              <p className="text-xs text-slate-400">
                Desde un teléfono, SmartExam utilizará preferentemente la cámara
                posterior.
              </p>

              <Input
                id="archivo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={seleccionarArchivo}
              />
            </div>

            {/* VISOR */}

            {preview ? (
              <div className="space-y-3">
                <div
                  className="
                  relative
                  flex
                  min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-950
                  p-4
                "
                >
                  {/* esquinas tipo escáner */}

                  <div className="pointer-events-none absolute inset-5">
                    <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-blue-500" />

                    <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-blue-500" />

                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-blue-500" />

                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-blue-500" />
                  </div>

                  <img
                    src={preview}
                    alt="Vista previa de ficha OMR"
                    className="
                    max-h-[420px] sm:max-h-[560px]
                    max-w-full
                    rounded-lg
                    object-contain
                  "
                  />
                </div>

                {archivo && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileImage className="h-5 w-5 shrink-0 text-slate-400" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {archivo.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Imagen lista
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="
                flex
                min-h-[300px] sm:min-h-[400px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-slate-50
                px-6
                text-center
              "
              >
                <div
                  className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  text-slate-400
                  shadow-sm
                "
                >
                  <Camera className="h-7 w-7" />
                </div>

                <p className="mt-5 font-medium text-slate-700">
                  Esperando una ficha
                </p>

                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  Toma una fotografía clara de la hoja completa o selecciona una
                  imagen desde el dispositivo.
                </p>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* BOTONES */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={procesarFicha}
                disabled={procesando || !archivo || !simulacroId}
                className="
                h-10
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                text-white
                hover:bg-blue-700
                w-full sm:w-auto
              "
              >
                {procesando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="h-4 w-4" />
                )}

                {procesando ? "Procesando ficha..." : "Procesar ficha"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={limpiar}
                disabled={procesando}
                className="h-10 gap-2 rounded-xl border-slate-200 w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* RESULTADO */}

        <div
          className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
              >
                <FileImage className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Resultado del procesamiento
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Información obtenida de la lectura óptica.
                </p>
              </div>
            </div>
          </div>

          {!resultado ? (
            <div
              className="
              flex
              min-h-[300px] sm:min-h-[450px] xl:min-h-[650px]
              flex-col
              items-center
              justify-center
              px-8
              text-center
            "
            >
              <div
                className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-50
                text-slate-400
              "
              >
                <ScanLine className="h-7 w-7" />
              </div>

              <p className="mt-5 font-medium text-slate-700">Sin resultados</p>

              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Procesa una ficha OMR para visualizar la identificación del
                alumno, la lectura y la calificación.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {/* PROCESADO */}

              <div className="border-b border-slate-100 bg-emerald-50/50 px-6 py-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />

                  <div>
                    <p className="text-sm font-semibold">
                      Ficha procesada correctamente
                    </p>

                    <p className="text-xs text-emerald-600">
                      La lectura OMR fue completada sin errores.
                    </p>
                  </div>
                </div>
              </div>

              {/* ALUMNO */}

              <div className="p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Postulante
                </p>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-100
                      text-lg
                      font-bold
                      text-blue-700
                    "
                    >
                      {resultado.alumno.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {resultado.alumno.nombre}
                      </p>

                      <p className="mt-0.5 font-mono text-sm text-slate-500">
                        DNI {resultado.alumno.dni}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <Dato
                      label="Carrera"
                      value={resultado.inscripcion.carrera}
                    />

                    <Dato label="Grupo" value={resultado.inscripcion.grupo} />
                  </div>
                </div>
              </div>

              {/* LECTURA OMR */}

              <div className="border-t border-slate-100 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Lectura OMR
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniCard
                    label="Respuestas"
                    value={resultado.lecturaOmr.totalRespuestas}
                  />

                  <MiniCard
                    label="Únicas"
                    value={resultado.lecturaOmr.unicas}
                  />

                  <MiniCard
                    label="Blancas"
                    value={resultado.lecturaOmr.blancas}
                  />

                  <MiniCard
                    label="Dobles"
                    value={resultado.lecturaOmr.dobles}
                  />
                </div>
              </div>

              {/* CALIFICACIÓN */}

              <div className="border-t border-slate-100 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Calificación
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniCard
                    label="Correctas"
                    value={resultado.resultado.correctas}
                  />

                  <MiniCard
                    label="Incorrectas"
                    value={resultado.resultado.incorrectas}
                  />

                  <MiniCard
                    label="Blancas"
                    value={resultado.resultado.blancas}
                  />

                  <MiniCard label="Dobles" value={resultado.resultado.dobles} />
                </div>
              </div>

              {/* PUNTAJE */}

              <div className="border-t border-slate-100 p-6">
                <div
                  className="
                  overflow-hidden
                  rounded-2xl
                  bg-slate-950
                  p-6
                  text-white
                "
                >
                  <p className="text-sm text-slate-400">Puntaje obtenido</p>

                  <div className="mt-2 flex items-end gap-2">
                    <p className="text-4xl font-bold tracking-tight">
                      {resultado.resultado.puntajeTotal}
                    </p>

                    <p className="mb-1 text-sm text-slate-400">
                      / {resultado.resultado.puntajeMaximo}
                    </p>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          resultado.resultado.puntajeMaximo > 0
                            ? Math.min(
                                100,
                                (resultado.resultado.puntajeTotal /
                                  resultado.resultado.puntajeMaximo) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
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

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
