"use client";

import { KeyRound, Mail, Pencil, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  estado: boolean;
  creadoEn?: string;

  rol: {
    id: number;
    nombre: string;
  };
}

interface Props {
  data: Usuario[];

  onEditar: (usuario: Usuario) => void;

  onCambiarEstado: (usuario: Usuario) => void;

  onPermisos: (usuario: Usuario) => void;
}

export default function UsuarioTable({
  data,
  onEditar,
  onCambiarEstado,
  onPermisos,
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
      {/* ===================================================== */}
      {/* CABECERA */}
      {/* ===================================================== */}

      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="font-semibold text-slate-900">Usuarios del sistema</h2>

        <p className="mt-1 text-sm text-slate-500">
          {data.length} usuario
          {data.length !== 1 ? "s" : ""} encontrado
          {data.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ===================================================== */}
      {/* VISTA MÓVIL */}
      {/* ===================================================== */}

      <div className="divide-y divide-slate-100 md:hidden">
        {data.map((usuario) => (
          <div key={usuario.id} className="space-y-4 p-4">
            {/* USUARIO + ESTADO */}

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
                    bg-sky-50
                    font-bold
                    text-sky-700
                  "
                >
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {usuario.nombre}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                    <p className="truncate text-xs text-slate-500">
                      {usuario.correo}
                    </p>
                  </div>
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
                    usuario.estado
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

                    ${usuario.estado ? "bg-emerald-500" : "bg-red-500"}
                  `}
                />

                {usuario.estado ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* ROL */}

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Rol</p>

              <span
                className={`
                  mt-2
                  inline-flex
                  rounded-lg
                  px-2.5
                  py-1
                  text-xs
                  font-semibold

                  ${
                    usuario.rol.nombre === "Administrador"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-blue-50 text-blue-700"
                  }
                `}
              >
                {usuario.rol.nombre}
              </span>
            </div>

            {/* ACCIONES MÓVIL */}

            <div
              className={`
                grid
                gap-2

                ${
                  usuario.rol.nombre === "Digitador"
                    ? "grid-cols-1"
                    : "grid-cols-2"
                }
              `}
            >
              {/* EDITAR */}

              <Button
                type="button"
                variant="outline"
                onClick={() => onEditar(usuario)}
                className="gap-2 rounded-xl border-slate-200"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>

              {/* PERMISOS TEMPORALES */}

              {usuario.rol.nombre === "Digitador" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onPermisos(usuario)}
                  className="
                    gap-2
                    rounded-xl
                    border-violet-200
                    text-violet-600
                    hover:bg-violet-50
                    hover:text-violet-700
                  "
                >
                  <KeyRound className="h-4 w-4" />
                  Permisos temporales
                </Button>
              )}

              {/* ACTIVAR / DESACTIVAR */}

              <Button
                type="button"
                variant="outline"
                onClick={() => onCambiarEstado(usuario)}
                className={
                  usuario.estado
                    ? "gap-2 rounded-xl border-slate-200 text-red-600 hover:bg-red-50"
                    : "gap-2 rounded-xl border-slate-200 text-emerald-600 hover:bg-emerald-50"
                }
              >
                {usuario.estado ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}

                {usuario.estado ? "Desactivar" : "Reactivar"}
              </Button>
            </div>
          </div>
        ))}

        {/* VACÍO MÓVIL */}

        {data.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-700">
              No se encontraron usuarios
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Intenta con otro criterio de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* VISTA DESKTOP */}
      {/* ===================================================== */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Usuario
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Correo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rol
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
            {data.map((usuario) => (
              <tr
                key={usuario.id}
                className="
                  border-b
                  border-slate-100
                  last:border-0
                  hover:bg-slate-50/70
                "
              >
                {/* USUARIO */}

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-sky-50
                        text-sm
                        font-bold
                        text-sky-700
                      "
                    >
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {usuario.nombre}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        ID {usuario.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CORREO */}

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />

                    {usuario.correo}
                  </div>
                </td>

                {/* ROL */}

                <td className="px-6 py-4">
                  <span
                    className={`
                      inline-flex
                      rounded-lg
                      px-2.5
                      py-1
                      text-xs
                      font-semibold

                      ${
                        usuario.rol.nombre === "Administrador"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    `}
                  >
                    {usuario.rol.nombre}
                  </span>
                </td>

                {/* ESTADO */}

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
                        usuario.estado
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

                        ${usuario.estado ? "bg-emerald-500" : "bg-red-500"}
                      `}
                    />

                    {usuario.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>

                {/* ACCIONES */}

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {/* EDITAR */}

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Editar usuario"
                      onClick={() => onEditar(usuario)}
                      className="
                        rounded-lg
                        border-slate-200
                        text-slate-600
                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* PERMISOS TEMPORALES */}

                    {usuario.rol.nombre === "Digitador" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Permisos temporales"
                        onClick={() => onPermisos(usuario)}
                        className="
                          rounded-lg
                          border-slate-200
                          text-slate-600
                          hover:bg-violet-50
                          hover:text-violet-600
                        "
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    )}

                    {/* ACTIVAR / DESACTIVAR */}

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={
                        usuario.estado
                          ? "Desactivar usuario"
                          : "Reactivar usuario"
                      }
                      onClick={() => onCambiarEstado(usuario)}
                      className={
                        usuario.estado
                          ? "rounded-lg border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                          : "rounded-lg border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                      }
                    >
                      {usuario.estado ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {/* VACÍO DESKTOP */}

            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="font-medium text-slate-700">
                    No se encontraron usuarios
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Intenta con otro criterio de búsqueda.
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
