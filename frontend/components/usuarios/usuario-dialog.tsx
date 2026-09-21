"use client";

import { FormEvent, useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  estado: boolean;

  rol: {
    id: number;
    nombre: string;
  };
}

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  usuario?: Usuario | null;

  roles: Rol[];

  onSaved: () => void;
}

export default function UsuarioDialog({
  open,
  onOpenChange,
  usuario,
  roles,
  onSaved,
}: Props) {
  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [password, setPassword] = useState("");

  const [rolId, setRolId] = useState("");

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const editando = Boolean(usuario);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (usuario) {
      setNombre(usuario.nombre);

      setCorreo(usuario.correo);

      setPassword("");

      setRolId(String(usuario.rol.id));

      setError("");
    } else {
      limpiar();
    }
  }, [open, usuario]);

  function limpiar() {
    setNombre("");
    setCorreo("");
    setPassword("");
    setRolId("");
    setError("");
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (!rolId) {
        setError("Selecciona un rol.");

        return;
      }

      if (usuario) {
        const datos: {
          nombre: string;
          correo: string;
          rolId: number;
          password?: string;
        } = {
          nombre,
          correo,
          rolId: Number(rolId),
        };

        if (password.trim()) {
          datos.password = password;
        }

        await api.patch(`/users/${usuario.id}`, datos);
      } else {
        if (!password.trim()) {
          setError("La contraseña es obligatoria para un usuario nuevo.");

          return;
        }

        await api.post("/users", {
          nombre,
          correo,
          password,
          rolId: Number(rolId),
        });
      }

      onOpenChange(false);

      limpiar();

      await onSaved();
    } catch (error: any) {
      const mensaje = error.response?.data?.message;

      setError(
        Array.isArray(mensaje)
          ? mensaje.join(", ")
          : mensaje || "No se pudo guardar el usuario.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    max-h-[90vh]
    w-[calc(100%-2rem)]
    overflow-y-auto
    sm:max-w-xl
  "
      >
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {editando ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>

          <DialogDescription className="text-slate-500">
            {editando
              ? "Actualiza los datos, rol o contraseña de esta cuenta."
              : "Crea una nueva cuenta de acceso para SmartExam."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>

            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del usuario"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo electrónico</Label>

            <Input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@smartexam.com"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>

            <select
              id="rol"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
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
              <option value="">Seleccione un rol</option>

              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-400">
              Los permisos efectivos dependen del rol asignado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {editando ? "Nueva contraseña" : "Contraseña"}
            </Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                editando
                  ? "Déjalo vacío para conservar la contraseña actual"
                  : "Ingrese una contraseña segura"
              }
              required={!editando}
              className="h-10"
            />

            {editando && (
              <p className="text-xs text-slate-400">
                Completa este campo únicamente si deseas cambiar la contraseña.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={guardando}
              className="
              rounded-xl
              bg-blue-600
              px-5
              text-white
              hover:bg-blue-700
            "
            >
              {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
