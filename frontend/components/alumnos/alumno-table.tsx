"use client";

import { Pencil, UserCheck, UserX } from "lucide-react";

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
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-4 text-left">DNI</th>

            <th className="p-4 text-left">Alumno</th>

            <th className="p-4 text-left">Correo</th>

            <th className="p-4 text-left">Estado</th>

            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((alumno) => (
            <tr
              key={alumno.id}
              className="border-b last:border-b-0 hover:bg-muted/30"
            >
              <td className="p-4">{alumno.dni}</td>

              <td className="p-4 font-medium">
                {alumno.nombres} {alumno.apellidos}
              </td>

              <td className="p-4">{alumno.correo || "-"}</td>

              <td className="p-4">
                <span
                  className={alumno.estado ? "text-green-600" : "text-red-600"}
                >
                  {alumno.estado ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Editar alumno"
                    onClick={() => onEditar(alumno)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title={
                      alumno.estado ? "Desactivar alumno" : "Reactivar alumno"
                    }
                    onClick={() => onCambiarEstado(alumno)}
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
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No se encontraron alumnos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
