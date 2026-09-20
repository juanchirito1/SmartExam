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
  open: boolean;
  onOpenChange: (open: boolean) => void;

  alumno?: Alumno | null;

  onSaved: () => void;
}

export default function AlumnoDialog({
  open,
  onOpenChange,
  alumno,
  onSaved,
}: Props) {
  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const editando = Boolean(alumno);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (alumno) {
      setDni(alumno.dni);
      setNombres(alumno.nombres);
      setApellidos(alumno.apellidos);

      setTelefono(alumno.telefono ?? "");

      setCorreo(alumno.correo ?? "");
    } else {
      limpiarFormulario();
    }
  }, [open, alumno]);

  function limpiarFormulario() {
    setDni("");
    setNombres("");
    setApellidos("");
    setTelefono("");
    setCorreo("");
    setError("");
  }

  async function guardarAlumno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datos = {
        dni,
        nombres,
        apellidos,
        telefono: telefono || undefined,
        correo: correo || undefined,
      };

      if (alumno) {
        await api.patch(`/alumnos/${alumno.id}`, datos);
      } else {
        await api.post("/alumnos", datos);
      }

      onOpenChange(false);

      limpiarFormulario();

      await onSaved();
    } catch (error: any) {
      const mensaje = error.response?.data?.message;

      if (Array.isArray(mensaje)) {
        setError(mensaje.join(", "));
      } else {
        setError(mensaje || "No se pudo guardar el alumno.");
      }
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() {
    onOpenChange(false);

    limpiarFormulario();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar alumno" : "Registrar alumno"}
          </DialogTitle>

          <DialogDescription>
            {editando
              ? "Modifica los datos del alumno seleccionado."
              : "Ingresa los datos del nuevo alumno."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardarAlumno} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>

            <Input
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              maxLength={8}
              placeholder="Ingrese DNI"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>

              <Input
                id="nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>

              <Input
                id="apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>

              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>

              <Input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar}>
              Cancelar
            </Button>

            <Button type="submit" disabled={guardando}>
              {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Registrar alumno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
