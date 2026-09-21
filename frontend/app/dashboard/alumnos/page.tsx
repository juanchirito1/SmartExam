"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import AlumnoHeader from "@/components/alumnos/alumno-header";
import AlumnoToolbar from "@/components/alumnos/alumno-toolbar";
import AlumnoTable from "@/components/alumnos/alumno-table";
import AlumnoDialog from "@/components/alumnos/alumno-dialog";
import AlumnoExcelDialog from "@/components/alumnos/alumno-excel-dialog";

interface Alumno {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  estado: boolean;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const [search, setSearch] = useState("");

  const [cargando, setCargando] = useState(true);

  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(
    null,
  );

  const [excelAbierto, setExcelAbierto] = useState(false);

  const [exportandoExcel, setExportandoExcel] = useState(false);

  async function cargarAlumnos() {
    try {
      const response = await api.get("/alumnos");

      setAlumnos(response.data);
    } catch (error) {
      console.error("Error cargando alumnos", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarAlumnos();
  }, []);

  function nuevoAlumno() {
    setAlumnoSeleccionado(null);

    setDialogAbierto(true);
  }

  function editarAlumno(alumno: Alumno) {
    setAlumnoSeleccionado(alumno);

    setDialogAbierto(true);
  }

  async function cambiarEstado(alumno: Alumno) {
    try {
      if (alumno.estado) {
        const confirmar = window.confirm(
          `¿Deseas desactivar a ${alumno.nombres} ${alumno.apellidos}?`,
        );

        if (!confirmar) {
          return;
        }

        await api.patch(`/alumnos/${alumno.id}/desactivar`);
      } else {
        const confirmar = window.confirm(
          `¿Deseas reactivar a ${alumno.nombres} ${alumno.apellidos}?`,
        );

        if (!confirmar) {
          return;
        }

        await api.patch(`/alumnos/${alumno.id}`, {
          estado: true,
        });
      }

      await cargarAlumnos();
    } catch (error) {
      console.error("Error cambiando estado del alumno", error);
    }
  }

  const alumnosFiltrados = alumnos.filter((alumno) => {
    const texto = `${alumno.dni} ${alumno.nombres} ${alumno.apellidos} ${
      alumno.correo ?? ""
    }`.toLowerCase();

    return texto.includes(search.trim().toLowerCase());
  });

  if (cargando) {
    return <div className="p-10">Cargando alumnos...</div>;
  }

  return (
    <div className="space-y-6">
      <AlumnoHeader />

      <AlumnoToolbar
        search={search}
        setSearch={setSearch}
        onNuevoAlumno={() => {
          /*
      Aquí conserva exactamente
      lo que ya tenías.
    */
        }}
        onImportarExcel={() => setExcelAbierto(true)}
        onExportarExcel={exportarExcel}
        exportando={exportandoExcel}
      />

      <AlumnoTable
        data={alumnosFiltrados}
        onEditar={editarAlumno}
        onCambiarEstado={cambiarEstado}
      />

      <AlumnoDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        alumno={alumnoSeleccionado}
        onSaved={cargarAlumnos}
      />

      <AlumnoExcelDialog
        open={excelAbierto}
        onOpenChange={setExcelAbierto}
        onImportado={cargarAlumnos}
      />
    </div>
  );
  async function exportarExcel() {
    setExportandoExcel(true);

    try {
      const response = await api.get("/alumnos-excel/exportar", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");

      const fecha = new Date().toISOString().slice(0, 10);

      enlace.href = url;

      enlace.download = `Alumnos_SmartExam_${fecha}.xlsx`;

      document.body.appendChild(enlace);

      enlace.click();

      enlace.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando alumnos:", error);
    } finally {
      setExportandoExcel(false);
    }
  }
}
