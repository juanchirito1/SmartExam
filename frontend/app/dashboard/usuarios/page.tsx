"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import UsuarioHeader from "@/components/usuarios/usuario-header";
import UsuarioToolbar from "@/components/usuarios/usuario-toolbar";
import UsuarioTable from "@/components/usuarios/usuario-table";
import UsuarioDialog from "@/components/usuarios/usuario-dialog";
import UsuarioPermisosDialog from "@/components/usuarios/usuario-permisos-dialog";

interface Rol {
  id: number;
  nombre: string;
}

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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [roles, setRoles] = useState<Rol[]>([]);

  const [search, setSearch] = useState("");

  const [cargando, setCargando] = useState(true);

  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const [usuarioPermisos, setUsuarioPermisos] = useState<Usuario | null>(null);

  const [permisosAbiertos, setPermisosAbiertos] = useState(false);

  async function cargarDatos() {
    try {
      const [usuariosResponse, rolesResponse] = await Promise.all([
        api.get("/users"),
        api.get("/users/roles"),
      ]);

      setUsuarios(usuariosResponse.data);

      setRoles(rolesResponse.data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function nuevoUsuario() {
    setUsuarioSeleccionado(null);

    setDialogAbierto(true);
  }

  function editarUsuario(usuario: Usuario) {
    setUsuarioSeleccionado(usuario);

    setDialogAbierto(true);
  }

  async function cambiarEstado(usuario: Usuario) {
    const accion = usuario.estado ? "desactivar" : "reactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} al usuario ${usuario.nombre}?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.patch(`/users/${usuario.id}`, {
        estado: !usuario.estado,
      });

      await cargarDatos();
    } catch (error) {
      console.error("Error cambiando estado del usuario", error);
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nombre} ${usuario.correo} ${
      usuario.rol.nombre
    }`.toLowerCase();

    return texto.includes(search.trim().toLowerCase());
  });

  if (cargando) {
    return <div className="p-10">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <UsuarioHeader />

      <UsuarioToolbar
        search={search}
        setSearch={setSearch}
        onNuevo={nuevoUsuario}
      />

      <UsuarioTable
        data={usuariosFiltrados}
        onEditar={editarUsuario}
        onCambiarEstado={cambiarEstado}
        onPermisos={(usuario)=>{
          setUsuarioPermisos(
            usuario,
          );

          setPermisosAbiertos(
            true,
          );
        }}
      />

      <UsuarioDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        usuario={usuarioSeleccionado}
        roles={roles}
        onSaved={cargarDatos}
      />

      <UsuarioPermisosDialog 
        open={permisosAbiertos}
        onOpenChange={setPermisosAbiertos}
        usuario={usuarioPermisos}
      />
    </div>
  );
}
