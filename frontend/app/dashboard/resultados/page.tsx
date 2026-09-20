"use client";

import { useEffect, useMemo, useState } from "react";

import { BarChart3, Search, Trophy, Users } from "lucide-react";

import { api } from "@/lib/api";

import { Input } from "@/components/ui/input";

interface Simulacro {
  id: number;
  numero: number;
  fecha: string;
  estado: string;

  ciclo: {
    id: number;
    nombre: string;
  };
}

interface Resumen {
  simulacroId: number;
  totalPostulantes: number;
  promedio: number;
  mejorPuntaje: number;
  menorPuntaje: number;
}

interface Ranking {
  puesto: number;

  alumno: {
    dni: string;
    nombre: string;
  };

  carrera: string;
  grupo: string;

  correctas: number;
  incorrectas: number;
  blancas: number;
  dobles: number;

  puntaje: number;
}

export default function ResultadosPage() {
  const [simulacros, setSimulacros] = useState<Simulacro[]>([]);

  const [simulacroId, setSimulacroId] = useState("");

  const [resumen, setResumen] = useState<Resumen | null>(null);

  const [ranking, setRanking] = useState<Ranking[]>([]);

  const [search, setSearch] = useState("");

  const [cargando, setCargando] = useState(true);

  const [cargandoResultados, setCargandoResultados] = useState(false);

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
        } else if (data.length > 0) {
          setSimulacroId(String(data[0].id));
        }
      } catch (error) {
        console.error("Error cargando simulacros", error);

        setError("No se pudieron cargar los simulacros.");
      } finally {
        setCargando(false);
      }
    }

    cargarSimulacros();
  }, []);

  useEffect(() => {
    if (!simulacroId) {
      return;
    }

    async function cargarResultados() {
      try {
        setCargandoResultados(true);

        setError("");

        const [resumenResponse, rankingResponse] = await Promise.all([
          api.get(`/resultados/simulacro/${simulacroId}/resumen`),

          api.get(`/resultados/simulacro/${simulacroId}/ranking`),
        ]);

        setResumen(resumenResponse.data);

        setRanking(
          Array.isArray(rankingResponse.data) ? rankingResponse.data : [],
        );
      } catch (error) {
        console.error("Error cargando resultados", error);

        setResumen(null);
        setRanking([]);

        setError("No se pudieron cargar los resultados del simulacro.");
      } finally {
        setCargandoResultados(false);
      }
    }

    cargarResultados();
  }, [simulacroId]);

  const rankingFiltrado = useMemo(() => {
    const busqueda = search.trim().toLowerCase();

    if (!busqueda) {
      return ranking;
    }

    return ranking.filter((item) => {
      const texto = `${item.alumno.dni} ${item.alumno.nombre} ${item.carrera} ${
        item.grupo
      }`.toLowerCase();

      return texto.includes(busqueda);
    });
  }, [ranking, search]);

  if (cargando) {
    return <div className="p-10">Cargando resultados...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resultados</h1>

        <p className="text-sm text-muted-foreground">
          Consulta calificaciones y ranking de los simulacros.
        </p>
      </div>

      <div className="max-w-md space-y-2">
        <label htmlFor="simulacro" className="text-sm font-medium">
          Simulacro
        </label>

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
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {cargandoResultados ? (
        <div className="py-10 text-center text-muted-foreground">
          Cargando información...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ResumenCard
              titulo="Postulantes"
              valor={resumen?.totalPostulantes ?? 0}
              icono={<Users className="h-5 w-5" />}
            />

            <ResumenCard
              titulo="Promedio"
              valor={resumen?.promedio ?? 0}
              icono={<BarChart3 className="h-5 w-5" />}
            />

            <ResumenCard
              titulo="Mejor puntaje"
              valor={resumen?.mejorPuntaje ?? 0}
              icono={<Trophy className="h-5 w-5" />}
            />

            <ResumenCard
              titulo="Menor puntaje"
              valor={resumen?.menorPuntaje ?? 0}
              icono={<BarChart3 className="h-5 w-5" />}
            />
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno, DNI o carrera..."
              className="pl-9"
            />
          </div>

          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b p-4">
              <h2 className="font-semibold">Ranking del simulacro</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-4 text-left">Puesto</th>

                    <th className="p-4 text-left">DNI</th>

                    <th className="p-4 text-left">Alumno</th>

                    <th className="p-4 text-left">Carrera</th>

                    <th className="p-4 text-left">Grupo</th>

                    <th className="p-4 text-center">Correctas</th>

                    <th className="p-4 text-center">Incorrectas</th>

                    <th className="p-4 text-center">Blancas</th>

                    <th className="p-4 text-center">Dobles</th>

                    <th className="p-4 text-right">Puntaje</th>
                  </tr>
                </thead>

                <tbody>
                  {rankingFiltrado.map((item) => (
                    <tr
                      key={`${item.puesto}-${item.alumno.dni}`}
                      className="border-b last:border-b-0 hover:bg-muted/30"
                    >
                      <td className="p-4 font-semibold">{item.puesto}</td>

                      <td className="p-4">{item.alumno.dni}</td>

                      <td className="p-4 font-medium">{item.alumno.nombre}</td>

                      <td className="p-4">{item.carrera}</td>

                      <td className="p-4">{item.grupo}</td>

                      <td className="p-4 text-center">{item.correctas}</td>

                      <td className="p-4 text-center">{item.incorrectas}</td>

                      <td className="p-4 text-center">{item.blancas}</td>

                      <td className="p-4 text-center">{item.dobles}</td>

                      <td className="p-4 text-right font-bold">
                        {item.puntaje}
                      </td>
                    </tr>
                  ))}

                  {rankingFiltrado.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-10 text-center text-muted-foreground"
                      >
                        No existen resultados para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResumenCard({
  titulo,
  valor,
  icono,
}: {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{titulo}</p>

        <div className="text-muted-foreground">{icono}</div>
      </div>

      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
