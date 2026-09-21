"use client";

import { Mail, Pencil, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Alumno {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  estado: boolean;
}

interface Props {
  data: Alumno[];
  onEditar: (alumno: Alumno) => void;
  onCambiarEstado: (alumno: Alumno) => void;
}

export default function AlumnoTable({
  data,
  onEditar,
  onCambiarEstado,
}: Props) {
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
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="font-semibold text-slate-900">Alumnos registrados</h2>

        <p className="mt-1 text-sm text-slate-500">
          {data.length} registro{data.length !== 1 ? "s" : ""} encontrado
          {data.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* MÓVIL */}

      <div className="divide-y divide-slate-100 md:hidden">
        {data.map((alumno) => (
          <div key={alumno.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-50
                    font-semibold
                    text-blue-700
                  "
                >
                  {alumno.nombres.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {alumno.nombres} {alumno.apellidos}
                  </p>

                  <p className="mt-0.5 font-mono text-xs text-slate-500">
                    DNI {alumno.dni}
                  </p>
                </div>
              </div>

              <span
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold

                  ${
                    alumno.estado
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }
                `}
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full

                    ${alumno.estado ? "bg-emerald-500" : "bg-red-500"}
                  `}
                />

                {alumno.estado ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-3">
              {alumno.correo && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                  <span className="truncate">{alumno.correo}</span>
                </div>
              )}

              {alumno.telefono && (
                <p className="text-sm text-slate-600">
                  Teléfono: {alumno.telefono}
                </p>
              )}

              {!alumno.correo && !alumno.telefono && (
                <p className="text-sm text-slate-400">Sin datos de contacto</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onEditar(alumno)}
                className="gap-2 rounded-xl border-slate-200"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onCambiarEstado(alumno)}
                className={
                  alumno.estado
                    ? "gap-2 rounded-xl border-slate-200 text-red-600 hover:bg-red-50"
                    : "gap-2 rounded-xl border-slate-200 text-emerald-600 hover:bg-emerald-50"
                }
              >
                {alumno.estado ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}

                {alumno.estado ? "Desactivar" : "Reactivar"}
              </Button>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-700">
              No se encontraron alumnos
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Intenta con otro término de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* DESKTOP */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                DNI
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Alumno
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contacto
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
            {data.map((alumno) => (
              <tr
                key={alumno.id}
                className="
                  border-b
                  border-slate-100
                  last:border-0
                  hover:bg-slate-50/70
                "
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {alumno.dni}
                  </span>
                </td>

                <td className="px-6 py-4">
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
                      {alumno.nombres.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {alumno.nombres} {alumno.apellidos}
                      </p>

                      {alumno.telefono && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {alumno.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {alumno.correo ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {alumno.correo}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Sin correo</span>
                  )}
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

                      ${
                        alumno.estado
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }
                    `}
                  >
                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full

                        ${alumno.estado ? "bg-emerald-500" : "bg-red-500"}
                      `}
                    />

                    {alumno.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onEditar(alumno)}
                      className="rounded-lg border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onCambiarEstado(alumno)}
                      className={
                        alumno.estado
                          ? "rounded-lg border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                          : "rounded-lg border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }
                    >
                      {alumno.estado ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="font-medium text-slate-700">
                    No se encontraron alumnos
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
