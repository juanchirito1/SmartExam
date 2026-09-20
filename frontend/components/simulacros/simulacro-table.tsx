"use client";

import Link from "next/link";

import { KeyRound, Pencil, UsersRound } from "lucide-react";

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

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-4 text-left">N°</th>

            <th className="p-4 text-left">Ciclo</th>

            <th className="p-4 text-left">Fecha</th>

            <th className="p-4 text-left">Preguntas</th>

            <th className="p-4 text-left">Estado</th>

            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((simulacro) => (
            <tr
              key={simulacro.id}
              className="border-b last:border-b-0 hover:bg-muted/30"
            >
              <td className="p-4 font-medium">{simulacro.numero}</td>

              <td className="p-4">{simulacro.ciclo.nombre}</td>

              <td className="p-4">{formatearFecha(simulacro.fecha)}</td>

              <td className="p-4">{simulacro.totalPreguntas}</td>

              <td className="p-4">
                <span
                  className={
                    simulacro.estado === "BORRADOR"
                      ? "text-amber-600"
                      : simulacro.estado === "FINALIZADO"
                        ? "text-green-600"
                        : "text-blue-600"
                  }
                >
                  {simulacro.estado}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-end gap-2">
                  {puedeAdministrar && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar simulacro"
                        onClick={() => onEditar(simulacro)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Link
                        href={`/dashboard/simulacros/${simulacro.id}/clave`}
                        title="Gestionar clave"
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
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
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No se encontraron simulacros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
