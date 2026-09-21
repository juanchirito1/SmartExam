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
    <div className="space-y-7">
      {/* ENCABEZADO */}

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
          <Trophy className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-amber-600">
            Análisis académico
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Resultados
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulta el desempeño, las calificaciones y el ranking de cada
            simulacro.
          </p>
        </div>
      </div>

      {/* SELECTOR */}

      <div
        className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
      >
        <div className="w-full md:max-w-md">
          <label
            htmlFor="simulacro"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Simulacro
          </label>

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
            bg-slate-50
            px-3
            text-sm
            text-slate-700
            outline-none
            focus:border-blue-500
            focus:bg-white
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
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {cargandoResultados ? (
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : (
        <>
          {/* KPIs */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ResumenCard
              titulo="Postulantes"
              valor={resumen?.totalPostulantes ?? 0}
              descripcion="Resultados procesados"
              icono={<Users className="h-5 w-5" />}
              tipo="blue"
            />

            <ResumenCard
              titulo="Promedio"
              valor={resumen?.promedio ?? 0}
              descripcion="Puntaje promedio"
              icono={<BarChart3 className="h-5 w-5" />}
              tipo="indigo"
            />

            <ResumenCard
              titulo="Mejor puntaje"
              valor={resumen?.mejorPuntaje ?? 0}
              descripcion="Mayor calificación"
              icono={<Trophy className="h-5 w-5" />}
              tipo="amber"
            />

            <ResumenCard
              titulo="Menor puntaje"
              valor={resumen?.menorPuntaje ?? 0}
              descripcion="Menor calificación"
              icono={<BarChart3 className="h-5 w-5" />}
              tipo="slate"
            />
          </div>

          {/* BUSCADOR */}

          <div
            className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
          "
          >
            <div className="relative w-full md:max-w-md">
              <Search
                className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
              />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por alumno, DNI, carrera o grupo..."
                className="
                h-10
                border-slate-200
                bg-slate-50
                pl-10
                focus:bg-white
              "
              />
            </div>
          </div>

          {/* RANKING */}

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
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Ranking del simulacro
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {rankingFiltrado.length} participante
                  {rankingFiltrado.length !== 1 ? "s" : ""} mostrado
                  {rankingFiltrado.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-50
                text-amber-600
              "
              >
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            {/* RANKING MÓVIL */}

            <div className="divide-y divide-slate-100 md:hidden">
              {rankingFiltrado.map((item) => (
                <div
                  key={`${item.puesto}-${item.alumno.dni}`}
                  className="space-y-4 p-4"
                >
                  {/* CABECERA */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-sm
              font-bold

              ${
                item.puesto === 1
                  ? "bg-amber-50 text-amber-700"
                  : item.puesto === 2
                    ? "bg-slate-100 text-slate-600"
                    : item.puesto === 3
                      ? "bg-orange-50 text-orange-700"
                      : "bg-slate-50 text-slate-600"
              }
            `}
                      >
                        {item.puesto}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {item.alumno.nombre}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          DNI {item.alumno.dni}
                        </p>
                      </div>
                    </div>

                    <span
                      className="
            inline-flex
            shrink-0
            rounded-xl
            bg-blue-50
            px-3
            py-1.5
            text-sm
            font-bold
            text-blue-700
          "
                    >
                      {item.puntaje}
                    </span>
                  </div>

                  {/* CARRERA */}

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Carrera</p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.carrera}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Grupo</p>

                        <span
                          className="
                mt-1
                inline-flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                bg-indigo-50
                px-2
                text-sm
                font-bold
                text-indigo-700
              "
                        >
                          {item.grupo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RESPUESTAS */}

                  <div className="grid grid-cols-4 gap-2">
                    <ResultadoMini
                      label="Correctas"
                      value={item.correctas}
                      tipo="correcta"
                    />

                    <ResultadoMini
                      label="Incorrectas"
                      value={item.incorrectas}
                      tipo="incorrecta"
                    />

                    <ResultadoMini
                      label="Blancas"
                      value={item.blancas}
                      tipo="blanca"
                    />

                    <ResultadoMini
                      label="Dobles"
                      value={item.dobles}
                      tipo="doble"
                    />
                  </div>
                </div>
              ))}

              {rankingFiltrado.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <p className="font-medium text-slate-700">
                    No existen resultados
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    No se encontraron participantes para los criterios
                    seleccionados.
                  </p>
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Puesto
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      DNI
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Alumno
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Carrera
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Grupo
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Correctas
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Incorrectas
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Blancas
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dobles
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Puntaje
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rankingFiltrado.map((item) => (
                    <tr
                      key={`${item.puesto}-${item.alumno.dni}`}
                      className="
                        border-b
                        border-slate-100
                        last:border-0
                        hover:bg-slate-50/70
                      "
                    >
                      {/* PUESTO */}

                      <td className="px-5 py-4">
                        <div className="flex items-center">
                          <span
                            className={`
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              text-sm
                              font-bold

                              ${
                                item.puesto === 1
                                  ? "bg-amber-50 text-amber-700"
                                  : item.puesto === 2
                                    ? "bg-slate-100 text-slate-600"
                                    : item.puesto === 3
                                      ? "bg-orange-50 text-orange-700"
                                      : "bg-slate-50 text-slate-600"
                              }
                            `}
                          >
                            {item.puesto}
                          </span>
                        </div>
                      </td>

                      {/* DNI */}

                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-slate-600">
                          {item.alumno.dni}
                        </span>
                      </td>

                      {/* ALUMNO */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-50
                              text-sm
                              font-semibold
                              text-blue-700
                            "
                          >
                            {item.alumno.nombre.charAt(0).toUpperCase()}
                          </div>

                          <p className="font-medium text-slate-900">
                            {item.alumno.nombre}
                          </p>
                        </div>
                      </td>

                      {/* CARRERA */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {item.carrera}
                        </p>
                      </td>

                      {/* GRUPO */}

                      <td className="px-5 py-4">
                        <span
                          className="
                            inline-flex
                            h-8
                            min-w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-50
                            px-2
                            text-sm
                            font-bold
                            text-indigo-700
                          "
                        >
                          {item.grupo}
                        </span>
                      </td>

                      {/* CORRECTAS */}

                      <td className="px-5 py-4 text-center">
                        <span className="font-semibold text-emerald-600">
                          {item.correctas}
                        </span>
                      </td>

                      {/* INCORRECTAS */}

                      <td className="px-5 py-4 text-center">
                        <span
                          className={
                            item.incorrectas > 0
                              ? "font-semibold text-red-600"
                              : "text-slate-400"
                          }
                        >
                          {item.incorrectas}
                        </span>
                      </td>

                      {/* BLANCAS */}

                      <td className="px-5 py-4 text-center">
                        <span
                          className={
                            item.blancas > 0
                              ? "font-semibold text-amber-600"
                              : "text-slate-400"
                          }
                        >
                          {item.blancas}
                        </span>
                      </td>

                      {/* DOBLES */}

                      <td className="px-5 py-4 text-center">
                        <span
                          className={
                            item.dobles > 0
                              ? "font-semibold text-orange-600"
                              : "text-slate-400"
                          }
                        >
                          {item.dobles}
                        </span>
                      </td>

                      {/* PUNTAJE */}

                      <td className="px-5 py-4 text-right">
                        <span
                          className="
                            inline-flex
                            rounded-xl
                            bg-blue-50
                            px-3
                            py-1.5
                            text-sm
                            font-bold
                            text-blue-700
                          "
                        >
                          {item.puntaje}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {rankingFiltrado.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-16 text-center">
                        <p className="font-medium text-slate-700">
                          No existen resultados
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          No se encontraron participantes para los criterios
                          seleccionados.
                        </p>
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
  descripcion,
  icono,
  tipo,
}: {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: React.ReactNode;
  tipo: "blue" | "indigo" | "amber" | "slate";
}) {
  const estilos = {
    blue: "bg-blue-50 text-blue-600",

    indigo: "bg-indigo-50 text-indigo-600",

    amber: "bg-amber-50 text-amber-600",

    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4 sm:p-5
        shadow-sm
        transition-all
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>

          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {valor}
          </p>

          <p className="mt-1 text-xs text-slate-400">{descripcion}</p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            ${estilos[tipo]}
          `}
        >
          {icono}
        </div>
      </div>
    </div>
  );
}

function ResultadoMini({
  label,
  value,
  tipo,
}: {
  label: string;
  value: number;
  tipo: "correcta" | "incorrecta" | "blanca" | "doble";
}) {
  const estilos = {
    correcta: "bg-emerald-50 text-emerald-700",

    incorrecta: "bg-red-50 text-red-700",

    blanca: "bg-amber-50 text-amber-700",

    doble: "bg-orange-50 text-orange-700",
  };

  return (
    <div
      className={`
        rounded-xl
        px-2
        py-3
        text-center
        ${estilos[tipo]}
      `}
    >
      <p className="text-lg font-bold">{value}</p>

      <p className="mt-0.5 truncate text-[10px] font-medium">{label}</p>
    </div>
  );
}
