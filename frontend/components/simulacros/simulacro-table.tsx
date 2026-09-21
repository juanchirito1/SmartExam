"use client";

import Link from "next/link";

import { CalendarDays, KeyRound, Pencil, UsersRound } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

interface Simulacro {
  id: number;
  numero: number;
  fecha: string;
  totalPreguntas: number;
  estado: string;

  ciclo: {
    id: number;
    nombre: string;
  };
}

interface Props {
  data: Simulacro[];

  onEditar: (simulacro: Simulacro) => void;

  puedeAdministrar: boolean;

  puedeGestionarInscripciones: boolean;
}

export default function SimulacroTable({
  data,
  onEditar,
  puedeAdministrar,
  puedeGestionarInscripciones,
}: Props) {
  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-PE");
  }

  function estadoClase(estado: string) {
    switch (estado) {
      case "ACTIVO":
        return "bg-emerald-50 text-emerald-700";

      case "FINALIZADO":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-amber-50 text-amber-700";
    }
  }

  function estadoPunto(estado: string) {
    switch (estado) {
      case "ACTIVO":
        return "bg-emerald-500";

      case "FINALIZADO":
        return "bg-slate-400";

      default:
        return "bg-amber-500";
    }
  }

  return (
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
        <h2 className="font-semibold text-slate-900">Simulacros registrados</h2>

        <p className="mt-1 text-sm text-slate-500">
          {data.length} evaluación{data.length !== 1 ? "es" : ""} encontrada
          {data.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {data.map((simulacro) => (
          <div key={simulacro.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-50
              font-bold
              text-indigo-700
            "
                >
                  {simulacro.numero}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Simulacro {simulacro.numero}
                  </p>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Ciclo {simulacro.ciclo.nombre}
                  </p>
                </div>
              </div>

              <span
                className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-xs
            font-semibold
            ${estadoClase(simulacro.estado)}
          `}
              >
                <span
                  className={`
              h-1.5
              w-1.5
              rounded-full
              ${estadoPunto(simulacro.estado)}
            `}
                />

                {simulacro.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-xs text-slate-400">Fecha</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatearFecha(simulacro.fecha)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Preguntas</p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {simulacro.totalPreguntas}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {puedeAdministrar && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEditar(simulacro)}
                  className="flex-1 gap-2 rounded-xl"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              )}

              {puedeAdministrar && (
                <Link
                  href={`/dashboard/simulacros/${simulacro.id}/clave`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "flex-1 gap-2 rounded-xl",
                  })}
                >
                  <KeyRound className="h-4 w-4" />
                  Clave
                </Link>
              )}

              {puedeGestionarInscripciones && (
                <Link
                  href={`/dashboard/simulacros/${simulacro.id}/inscripciones`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full gap-2 rounded-xl",
                  })}
                >
                  <UsersRound className="h-4 w-4" />
                  Inscripciones
                </Link>
              )}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-700">
              No se encontraron simulacros
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Registra una evaluación o modifica la búsqueda.
            </p>
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Simulacro
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ciclo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fecha
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preguntas
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((simulacro) => (
              <tr
                key={simulacro.id}
                className="
                  border-b
                  border-slate-100
                  last:border-0
                  hover:bg-slate-50/70
                "
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-indigo-50
                        font-bold
                        text-indigo-700
                      "
                    >
                      {simulacro.numero}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        Simulacro {simulacro.numero}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Evaluación académica
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className="
                      inline-flex
                      rounded-lg
                      bg-blue-50
                      px-2.5
                      py-1
                      text-sm
                      font-medium
                      text-blue-700
                    "
                  >
                    {simulacro.ciclo.nombre}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    {formatearFecha(simulacro.fecha)}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">
                    {simulacro.totalPreguntas}
                  </p>

                  <p className="text-xs text-slate-400">preguntas</p>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      ${estadoClase(simulacro.estado)}
                    `}
                  >
                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${estadoPunto(simulacro.estado)}
                      `}
                    />

                    {simulacro.estado}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {puedeAdministrar && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Editar simulacro"
                          onClick={() => onEditar(simulacro)}
                          className="rounded-lg border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Link
                          href={`/dashboard/simulacros/${simulacro.id}/clave`}
                          title="Gestionar clave"
                          className={buttonVariants({
                            variant: "outline",
                            size: "icon",
                            className:
                              "rounded-lg border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600",
                          })}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Link>
                      </>
                    )}

                    {puedeGestionarInscripciones && (
                      <Link
                        href={`/dashboard/simulacros/${simulacro.id}/inscripciones`}
                        title="Gestionar inscripciones"
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
                          className:
                            "rounded-lg border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
                        })}
                      >
                        <UsersRound className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="font-medium text-slate-700">
                    No se encontraron simulacros
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Registra una nueva evaluación o cambia los criterios de
                    búsqueda.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
