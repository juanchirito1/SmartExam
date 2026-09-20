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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>

          <DialogDescription>
            {editando
              ? "Modifica los datos y el acceso del usuario."
              : "Registra un nuevo usuario del sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>

            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del usuario"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo</Label>

            <Input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@smartexam.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>

            <select
              id="rol"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Seleccione un rol</option>

              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
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
                  ? "Déjalo vacío para mantener la actual"
                  : "Ingrese una contraseña"
              }
              required={!editando}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={guardando}>
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
