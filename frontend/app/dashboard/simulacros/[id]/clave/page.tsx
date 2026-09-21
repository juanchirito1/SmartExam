"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, Save, CheckCircle2, KeyRound } from "lucide-react";

import Link from "next/link";

import { useParams } from "next/navigation";

import { api } from "@/lib/api";

import { Button, buttonVariants } from "@/components/ui/button";

interface Area {
  id: number;
  nombre: string;
}

interface Simulacro {
  id: number;
  numero: number;
  totalPreguntas: number;
  estado: string;

  ciclo: {
    id: number;
    nombre: string;
  };
}

interface Pregunta {
  id?: number;
  numero: number;
  areaId: number;
  respuestaCorrecta: string;

  area?: Area;
}

export default function ClaveSimulacroPage() {
  const params = useParams();

  const simulacroId = Number(params.id);

  const [simulacro, setSimulacro] = useState<Simulacro | null>(null);

  const [areas, setAreas] = useState<Area[]>([]);

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  const [cargando, setCargando] = useState(true);

  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);

        const [simulacroResponse, areasResponse, preguntasResponse] =
          await Promise.all([
            api.get(`/simulacros/${simulacroId}`),

            api.get("/areas"),

            api.get(`/preguntas/simulacro/${simulacroId}`),
          ]);

        const simulacroData = simulacroResponse.data;

        const areasData: Area[] = areasResponse.data;

        const preguntasData: Pregunta[] = preguntasResponse.data;

        setSimulacro(simulacroData);

        setAreas(areasData);

        if (preguntasData.length > 0) {
          setPreguntas(
            preguntasData.map((pregunta) => ({
              numero: pregunta.numero,

              areaId: pregunta.areaId,

              respuestaCorrecta: pregunta.respuestaCorrecta,
            })),
          );
        } else {
          const nuevasPreguntas = Array.from(
            {
              length: simulacroData.totalPreguntas,
            },
            (_, index) => {
              const numero = index + 1;

              let areaId = areasData[0]?.id ?? 0;

              /*
               * Para simulacros de 80 preguntas
               * distribuimos automáticamente
               * 20 preguntas por cada área.
               */
              if (
                simulacroData.totalPreguntas === 80 &&
                areasData.length === 4
              ) {
                const bloque = Math.floor(index / 20);

                areaId = areasData[bloque].id;
              }

              return {
                numero,
                areaId,
                respuestaCorrecta: "",
              };
            },
          );

          setPreguntas(nuevasPreguntas);
        }
      } catch (error) {
        console.error("Error cargando clave", error);

        setError("No se pudo cargar la clave del simulacro.");
      } finally {
        setCargando(false);
      }
    }

    if (simulacroId) {
      cargar();
    }
  }, [simulacroId]);

  function cambiarRespuesta(numero: number, respuesta: string) {
    setPreguntas(
      preguntas.map((pregunta) =>
        pregunta.numero === numero
          ? {
              ...pregunta,
              respuestaCorrecta: respuesta,
            }
          : pregunta,
      ),
    );
  }

  function cambiarArea(numero: number, areaId: number) {
    setPreguntas(
      preguntas.map((pregunta) =>
        pregunta.numero === numero
          ? {
              ...pregunta,
              areaId,
            }
          : pregunta,
      ),
    );
  }

  async function guardarClave() {
    try {
      setError("");
      setMensaje("");

      const incompletas = preguntas.filter(
        (pregunta) => !pregunta.respuestaCorrecta || !pregunta.areaId,
      );

      if (incompletas.length > 0) {
        setError(`Faltan completar ${incompletas.length} preguntas.`);

        return;
      }

      setGuardando(true);

      await api.post("/preguntas/cargar-clave", {
        simulacroId,

        preguntas: preguntas.map((pregunta) => ({
          numero: pregunta.numero,

          areaId: pregunta.areaId,

          respuestaCorrecta: pregunta.respuestaCorrecta,
        })),
      });

      setMensaje("Clave guardada correctamente.");
    } catch (error: any) {
      const mensajeBackend = error.response?.data?.message;

      setError(
        Array.isArray(mensajeBackend)
          ? mensajeBackend.join(", ")
          : mensajeBackend || "No se pudo guardar la clave.",
      );
    } finally {
      setGuardando(false);
    }
  }

  const preguntasCompletadas = preguntas.filter(
    (pregunta) => pregunta.areaId && pregunta.respuestaCorrecta,
  ).length;

  const porcentajeCompletado =
    preguntas.length > 0
      ? Math.round((preguntasCompletadas / preguntas.length) * 100)
      : 0;

  if (cargando) {
    return <div className="p-10">Cargando clave...</div>;
  }

  if (!simulacro) {
    return <div>Simulacro no encontrado.</div>;
  }

  return (
    <div className="space-y-7">
      {/* ENCABEZADO */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-amber-50
            text-amber-600
          "
          >
            <KeyRound className="h-6 w-6" />
          </div>

          <div>
            <Link
              href="/dashboard/simulacros"
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a simulacros
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Clave del Simulacro {simulacro.numero}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ciclo {simulacro.ciclo.nombre}
              {" · "}
              {simulacro.totalPreguntas} preguntas
            </p>
          </div>
        </div>

        <Button
          onClick={guardarClave}
          disabled={guardando}
          className="
          h-10
          gap-2
          rounded-xl
          bg-blue-600
          px-5
          text-white
          hover:bg-blue-700
          sm:w-auto
        "
        >
          <Save className="h-4 w-4" />

          {guardando ? "Guardando..." : "Guardar clave"}
        </Button>
      </div>

      {/* RESUMEN */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total de preguntas</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {preguntas.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Preguntas configuradas</p>

          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />

            <p className="text-3xl font-bold text-slate-900">
              {preguntasCompletadas}
            </p>
          </div>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Progreso</p>

            <span className="text-sm font-semibold text-blue-600">
              {porcentajeCompletado}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${porcentajeCompletado}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MENSAJES */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {mensaje}
        </div>
      )}

      {/* CLAVE */}

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
          <h2 className="font-semibold text-slate-900">
            Configuración de respuestas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Define el área académica y la alternativa correcta para cada
            pregunta.
          </p>
        </div>

        {/* VISTA MÓVIL */}

        <div className="divide-y divide-slate-100 md:hidden">
          {preguntas.map((pregunta) => (
            <div key={pregunta.numero} className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-sm
              font-bold
              text-slate-700
            "
                  >
                    {pregunta.numero}
                  </div>

                  <p className="font-medium text-slate-900">
                    Pregunta {pregunta.numero}
                  </p>
                </div>

                {pregunta.areaId && pregunta.respuestaCorrecta && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Área académica
                </label>

                <select
                  value={pregunta.areaId}
                  onChange={(e) =>
                    cambiarArea(pregunta.numero, Number(e.target.value))
                  }
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
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">
                  Respuesta correcta
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {["A", "B", "C", "D", "E"].map((alternativa) => {
                    const seleccionada =
                      pregunta.respuestaCorrecta === alternativa;

                    return (
                      <button
                        key={alternativa}
                        type="button"
                        onClick={() =>
                          cambiarRespuesta(pregunta.numero, alternativa)
                        }
                        className={`
                  flex
                  h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  text-sm
                  font-semibold
                  transition

                  ${
                    seleccionada
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
                      >
                        {alternativa}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden max-h-[650px] overflow-auto md:block">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-32 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pregunta
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Área
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Respuesta correcta
                </th>
              </tr>
            </thead>

            <tbody>
              {preguntas.map((pregunta) => (
                <tr
                  key={pregunta.numero}
                  className="
                    border-b
                    border-slate-100
                    last:border-0
                    hover:bg-slate-50/70
                  "
                >
                  <td className="px-6 py-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-sm
                        font-bold
                        text-slate-700
                      "
                    >
                      {pregunta.numero}
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <select
                      value={pregunta.areaId}
                      onChange={(e) =>
                        cambiarArea(pregunta.numero, Number(e.target.value))
                      }
                      className="
                        h-9
                        w-full
                        max-w-md
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
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      {["A", "B", "C", "D", "E"].map((alternativa) => {
                        const seleccionada =
                          pregunta.respuestaCorrecta === alternativa;

                        return (
                          <button
                            key={alternativa}
                            type="button"
                            onClick={() =>
                              cambiarRespuesta(pregunta.numero, alternativa)
                            }
                            className={`
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                border
                                text-sm
                                font-semibold
                                transition-all

                                ${
                                  seleccionada
                                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                }
                              `}
                          >
                            {alternativa}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <p className="text-sm text-slate-500">
            {preguntasCompletadas} de {preguntas.length} preguntas configuradas
          </p>

          <Button
            onClick={guardarClave}
            disabled={guardando}
            className="gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Guardar clave
          </Button>
        </div>
      </div>
    </div>
  );
}
