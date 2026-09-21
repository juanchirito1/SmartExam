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

interface Ciclo {
  id: number;
  nombre: string;
  estado: boolean;
}

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulacro?: Simulacro | null;
  ciclos: Ciclo[];
  onSaved: () => void;
}

export default function SimulacroDialog({
  open,
  onOpenChange,
  simulacro,
  ciclos,
  onSaved,
}: Props) {
  const [numero, setNumero] = useState("");

  const [fecha, setFecha] = useState("");

  const [cicloId, setCicloId] = useState("");

  const [totalPreguntas, setTotalPreguntas] = useState("80");

  const [estado, setEstado] = useState("BORRADOR");

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const editando = Boolean(simulacro);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (simulacro) {
      setNumero(String(simulacro.numero));

      setFecha(simulacro.fecha.substring(0, 10));

      setCicloId(String(simulacro.ciclo.id));

      setTotalPreguntas(String(simulacro.totalPreguntas));

      setEstado(simulacro.estado);
    } else {
      limpiarFormulario();
    }
  }, [open, simulacro]);

  function limpiarFormulario() {
    setNumero("");
    setFecha("");
    setCicloId("");
    setTotalPreguntas("80");
    setEstado("BORRADOR");
    setError("");
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (simulacro) {
        await api.patch(`/simulacros/${simulacro.id}`, {
          numero: Number(numero),

          fecha,

          totalPreguntas: Number(totalPreguntas),

          estado,
        });
      } else {
        await api.post("/simulacros", {
          numero: Number(numero),

          fecha,

          cicloId: Number(cicloId),

          totalPreguntas: Number(totalPreguntas),
        });
      }

      onOpenChange(false);

      limpiarFormulario();

      await onSaved();
    } catch (error: any) {
      const mensaje = error.response?.data?.message;

      setError(
        Array.isArray(mensaje)
          ? mensaje.join(", ")
          : mensaje || "No se pudo guardar el simulacro.",
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
            {editando ? "Editar simulacro" : "Nuevo simulacro"}
          </DialogTitle>

          <DialogDescription className="text-slate-500">
            {editando
              ? "Actualiza la configuración de esta evaluación."
              : "Configura una nueva evaluación académica."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-5 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de simulacro</Label>

              <Input
                id="numero"
                type="number"
                min="1"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de evaluación</Label>

              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo académico</Label>

            <select
              id="ciclo"
              value={cicloId}
              onChange={(e) => setCicloId(e.target.value)}
              disabled={editando}
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
              <option value="">Seleccione un ciclo</option>

              {ciclos
                .filter((ciclo) => ciclo.estado)
                .map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.nombre}
                  </option>
                ))}
            </select>

            {editando && (
              <p className="text-xs text-slate-400">
                El ciclo no puede modificarse después de crear el simulacro.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPreguntas">Total de preguntas</Label>

            <Input
              id="totalPreguntas"
              type="number"
              min="1"
              max="120"
              value={totalPreguntas}
              onChange={(e) => setTotalPreguntas(e.target.value)}
              required
              className="h-10"
            />

            <p className="text-xs text-slate-400">
              SmartExam admite evaluaciones de hasta 120 preguntas.
            </p>
          </div>

          {editando && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>

              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
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
                <option value="BORRADOR">Borrador</option>

                <option value="ACTIVO">Activo</option>

                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>
          )}

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
              className="rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Crear simulacro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
