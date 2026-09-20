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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editando ? "Editar simulacro" : "Nuevo simulacro"}
          </DialogTitle>

          <DialogDescription>
            {editando
              ? "Modifica la configuración del simulacro."
              : "Registra un nuevo simulacro académico."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>

              <Input
                id="numero"
                type="number"
                min="1"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>

              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo</Label>

            <select
              id="ciclo"
              value={cicloId}
              onChange={(e) => setCicloId(e.target.value)}
              disabled={editando}
              required
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
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
            />
          </div>

          {editando && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>

              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="BORRADOR">BORRADOR</option>

                <option value="ACTIVO">ACTIVO</option>

                <option value="FINALIZADO">FINALIZADO</option>
              </select>
            </div>
          )}

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
                  : "Crear simulacro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
