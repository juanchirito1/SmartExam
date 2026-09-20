"use client";

import { Pencil, UserCheck, UserX } from "lucide-react";

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
}

export default function UsuarioTable({
  data,
  onEditar,
  onCambiarEstado,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-4 text-left">Nombre</th>

            <th className="p-4 text-left">Correo</th>

            <th className="p-4 text-left">Rol</th>

            <th className="p-4 text-left">Estado</th>

            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((usuario) => (
            <tr
              key={usuario.id}
              className="border-b last:border-b-0 hover:bg-muted/30"
            >
              <td className="p-4 font-medium">{usuario.nombre}</td>

              <td className="p-4">{usuario.correo}</td>

              <td className="p-4">{usuario.rol.nombre}</td>

              <td className="p-4">
                <span
                  className={usuario.estado ? "text-green-600" : "text-red-600"}
                >
                  {usuario.estado ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Editar usuario"
                    onClick={() => onEditar(usuario)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

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

          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No se encontraron usuarios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
