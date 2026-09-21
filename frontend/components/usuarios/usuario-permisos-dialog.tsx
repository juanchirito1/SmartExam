"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;

  rol: {
    id: number;
    nombre: string;
  };
}

interface Permiso {
  id: number;
  nombre: string;
}

interface PermisoTemporal {
  id: number;
  permisoId: number;
  nombre: string;

  fechaInicio: string;
  fechaFin: string;

  estado: boolean;
  vigente: boolean;

  asignadoPor?: {
    id: number;
    nombre: string;
  } | null;
}

interface RespuestaPermisos {
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };

  permisosBase: Permiso[];

  disponibles: Permiso[];

  temporales: PermisoTemporal[];
}

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  usuario: Usuario | null;
}

export default function UsuarioPermisosDialog({
  open,
  onOpenChange,
  usuario,
}: Props) {
  const [datos, setDatos] = useState<RespuestaPermisos | null>(null);

  const [permisoId, setPermisoId] = useState("");

  const [fechaFin, setFechaFin] = useState("");

  const [cargando, setCargando] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const [revocandoId, setRevocandoId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  // =========================================================
  // FECHA PREDETERMINADA: +24 HORAS
  // =========================================================

  function obtenerFechaPredeterminada() {
    const fecha = new Date();

    fecha.setHours(fecha.getHours() + 24);

    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);

    return local.toISOString().slice(0, 16);
  }

  // =========================================================
  // CARGAR PERMISOS
  // =========================================================

  async function cargarPermisos() {
    if (!usuario) {
      return;
    }

    setCargando(true);
    setError("");

    try {
      const response = await api.get(
        `/users/${usuario.id}/permisos-temporales`,
      );

      setDatos(response.data);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "No se pudieron cargar los permisos.",
      );
    } finally {
      setCargando(false);
    }
  }

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  useEffect(() => {
    if (open && usuario) {
      setDatos(null);

      setPermisoId("");

      setFechaFin(obtenerFechaPredeterminada());

      setError("");
      setMensaje("");

      cargarPermisos();
    }
  }, [open, usuario]);

  // =========================================================
  // CONCEDER PERMISO
  // =========================================================

  async function concederPermiso() {
    if (!usuario || !permisoId || !fechaFin) {
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const fecha = new Date(fechaFin);

      if (Number.isNaN(fecha.getTime())) {
        setError("La fecha seleccionada no es válida.");

        return;
      }

      await api.post(`/users/${usuario.id}/permisos-temporales`, {
        permisoId: Number(permisoId),

        fechaFin: fecha.toISOString(),
      });

      setMensaje("Permiso temporal concedido correctamente.");

      setPermisoId("");

      setFechaFin(obtenerFechaPredeterminada());

      await cargarPermisos();
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "No se pudo conceder el permiso.",
      );
    } finally {
      setGuardando(false);
    }
  }

  // =========================================================
  // REVOCAR
  // =========================================================

  async function revocarPermiso(id: number) {
    setRevocandoId(id);

    setError("");
    setMensaje("");

    try {
      await api.patch(`/users/permisos-temporales/${id}/revocar`);

      setMensaje("Permiso temporal revocado.");

      await cargarPermisos();
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "No se pudo revocar el permiso.",
      );
    } finally {
      setRevocandoId(null);
    }
  }

  // =========================================================
  // FECHA VISUAL
  // =========================================================

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "medium",

      timeStyle: "short",
    });
  }

  const temporalesVigentes =
    datos?.temporales.filter((item) => item.vigente) ?? [];

  const historial = datos?.temporales.filter((item) => !item.vigente) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-h-[90vh]
          w-[calc(100%-2rem)]
          overflow-y-auto
          sm:max-w-3xl
        "
      >
        {/* HEADER */}

        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <KeyRound className="h-5 w-5 text-blue-600" />
            Permisos temporales
          </DialogTitle>

          <DialogDescription>
            {usuario
              ? `Administra accesos adicionales para ${usuario.nombre}.`
              : "Administra permisos temporales."}
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : datos ? (
          <div className="space-y-6">
            {/* USUARIO */}

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  font-bold
                  text-blue-700
                "
              >
                {datos.usuario.nombre.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {datos.usuario.nombre}
                </p>

                <p className="text-sm text-slate-500">
                  {datos.usuario.correo}
                  {" · "}
                  {datos.usuario.rol}
                </p>
              </div>
            </div>

            {/* PERMISOS BASE */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />

                <h3 className="font-semibold text-slate-900">
                  Permisos base del rol
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {datos.permisosBase.map((permiso) => (
                  <span
                    key={permiso.id}
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-slate-700
                      "
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />

                    {permiso.nombre}
                  </span>
                ))}
              </div>
            </section>

            {/* TEMPORALES ACTIVOS */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />

                <h3 className="font-semibold text-slate-900">
                  Permisos temporales activos
                </h3>
              </div>

              {temporalesVigentes.length === 0 ? (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-slate-200
                    px-4
                    py-6
                    text-center
                    text-sm
                    text-slate-400
                  "
                >
                  Este usuario no tiene permisos temporales activos.
                </div>
              ) : (
                <div className="space-y-3">
                  {temporalesVigentes.map((item) => (
                    <div
                      key={item.id}
                      className="
                          flex
                          flex-col
                          gap-3
                          rounded-xl
                          border
                          border-blue-100
                          bg-blue-50/50
                          p-4

                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />

                          <p className="font-semibold text-slate-800">
                            {item.nombre}
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Válido hasta {formatearFecha(item.fechaFin)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={revocandoId === item.id}
                        onClick={() => revocarPermiso(item.id)}
                        className="
                            gap-2
                            rounded-xl
                            border-red-200
                            text-red-600
                            hover:bg-red-50
                          "
                      >
                        {revocandoId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Revocar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* CONCEDER */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                p-4
                sm:p-5
              "
            >
              <h3 className="font-semibold text-slate-900">
                Conceder permiso temporal
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                El permiso dejará de funcionar automáticamente al llegar la
                fecha de vencimiento.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* PERMISO */}

                <div className="space-y-2">
                  <Label>Permiso</Label>

                  <select
                    value={permisoId}
                    onChange={(e) => setPermisoId(e.target.value)}
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                    "
                  >
                    <option value="">Seleccione un permiso</option>

                    {datos.disponibles.map((permiso) => (
                      <option key={permiso.id} value={permiso.id}>
                        {permiso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* VENCIMIENTO */}

                <div className="space-y-2">
                  <Label>Válido hasta</Label>

                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                    "
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={concederPermiso}
                disabled={!permisoId || !fechaFin || guardando}
                className="
                  mt-4
                  w-full
                  gap-2
                  rounded-xl
                  bg-blue-600
                  text-white
                  hover:bg-blue-700

                  sm:w-auto
                "
              >
                {guardando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}

                {guardando ? "Concediendo..." : "Conceder permiso"}
              </Button>
            </section>

            {/* HISTORIAL */}

            {historial.length > 0 && (
              <section>
                <h3 className="mb-3 font-semibold text-slate-900">Historial</h3>

                <div className="space-y-2">
                  {historial.map((item) => (
                    <div
                      key={item.id}
                      className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          rounded-xl
                          bg-slate-50
                          px-4
                          py-3
                        "
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {item.nombre}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Hasta {formatearFecha(item.fechaFin)}
                        </p>
                      </div>

                      <span
                        className="
                            rounded-full
                            bg-slate-200
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-slate-600
                          "
                      >
                        {item.estado ? "Expirado" : "Revocado"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
