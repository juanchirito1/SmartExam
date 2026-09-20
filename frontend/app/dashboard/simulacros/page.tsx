"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import SimulacroHeader from "@/components/simulacros/simulacro-header";
import SimulacroToolbar from "@/components/simulacros/simulacro-toolbar";
import SimulacroTable from "@/components/simulacros/simulacro-table";
import SimulacroDialog from "@/components/simulacros/simulacro-dialog";

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

interface Perfil {
  id: number;
  nombre: string;
  correo: string;

  rol: {
    id: number;
    nombre: string;
  };

  permisos: string[];
}

export default function SimulacrosPage() {
  const [simulacros, setSimulacros] = useState<Simulacro[]>([]);

  const [ciclos, setCiclos] = useState<Ciclo[]>([]);

  const [search, setSearch] = useState("");

  const [cargando, setCargando] = useState(true);

  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [simulacroSeleccionado, setSimulacroSeleccionado] =
    useState<Simulacro | null>(null);

  const [perfil, setPerfil] = useState<Perfil | null>(null);

  async function cargarDatos() {
    try {
      const [simulacrosResponse, ciclosResponse, perfilResponse] =
        await Promise.all([
          api.get("/simulacros"),
          api.get("/ciclos"),
          api.get("/auth/me"),
        ]);

      setSimulacros(simulacrosResponse.data);

      setCiclos(ciclosResponse.data);

      setPerfil(perfilResponse.data);
    } catch (error) {
      console.error("Error cargando simulacros", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function nuevoSimulacro() {
    setSimulacroSeleccionado(null);

    setDialogAbierto(true);
  }

  function editarSimulacro(simulacro: Simulacro) {
    setSimulacroSeleccionado(simulacro);

    setDialogAbierto(true);
  }

  const simulacrosFiltrados = simulacros.filter((simulacro) => {
    const texto =
      `${simulacro.numero} ${simulacro.ciclo.nombre} ${simulacro.estado}`.toLowerCase();

    return texto.includes(search.trim().toLowerCase());
  });

  const puedeAdministrar =
    perfil?.permisos.includes("CREAR_SIMULACRO") ?? false;

  const puedeGestionarInscripciones =
    perfil?.permisos.includes("GENERAR_CARNETS") ?? false;

  if (cargando) {
    return <div className="p-10">Cargando simulacros...</div>;
  }

  return (
    <div className="space-y-6">
      <SimulacroHeader />

      <SimulacroToolbar
        search={search}
        setSearch={setSearch}
        onNuevo={nuevoSimulacro}
        puedeCrear={puedeAdministrar}
      />

      <SimulacroTable 
        data={simulacrosFiltrados} 
        onEditar={editarSimulacro} 
        puedeAdministrar={puedeAdministrar} 
        puedeGestionarInscripciones={puedeGestionarInscripciones} />

      <SimulacroDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        simulacro={simulacroSeleccionado}
        ciclos={ciclos}
        onSaved={cargarDatos}
      />
    </div>
  );
}
