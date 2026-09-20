"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, Save } from "lucide-react";

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

  if (cargando) {
    return <div className="p-10">Cargando clave...</div>;
  }

  if (!simulacro) {
    return <div>Simulacro no encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3">
            <Link
              href="/dashboard/simulacros"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </div>

          <h1 className="text-2xl font-bold">
            Clave del Simulacro {simulacro.numero}
          </h1>

          <p className="text-sm text-muted-foreground">
            Ciclo {simulacro.ciclo.nombre}
            {" · "}
            {simulacro.totalPreguntas} preguntas
          </p>
        </div>

        <Button onClick={guardarClave} disabled={guardando}>
          <Save className="mr-2 h-4 w-4" />

          {guardando ? "Guardando..." : "Guardar clave"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left">Pregunta</th>

              <th className="p-3 text-left">Área</th>

              <th className="p-3 text-left">Respuesta correcta</th>
            </tr>
          </thead>

          <tbody>
            {preguntas.map((pregunta) => (
              <tr key={pregunta.numero} className="border-b last:border-b-0">
                <td className="p-3 font-medium">{pregunta.numero}</td>

                <td className="p-3">
                  <select
                    value={pregunta.areaId}
                    onChange={(e) =>
                      cambiarArea(pregunta.numero, Number(e.target.value))
                    }
                    className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    {["A", "B", "C", "D", "E"].map((alternativa) => (
                      <Button
                        key={alternativa}
                        type="button"
                        size="sm"
                        variant={
                          pregunta.respuestaCorrecta === alternativa
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          cambiarRespuesta(pregunta.numero, alternativa)
                        }
                      >
                        {alternativa}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
