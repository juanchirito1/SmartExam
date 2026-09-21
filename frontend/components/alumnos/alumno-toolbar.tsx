"use client";

import { Download, FileSpreadsheet, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;

  setSearch: (value: string) => void;

  onNuevoAlumno: () => void;

  onImportarExcel: () => void;

  onExportarExcel: () => void;

  exportando?: boolean;
}

export default function AlumnoToolbar({
  search,
  setSearch,
  onNuevoAlumno,
  onImportarExcel,
  onExportarExcel,
  exportando = false,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      {/* BUSCADOR */}

      <div className="relative w-full md:max-w-md">
        <Search
          className="
            absolute
            left-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-slate-400
          "
        />

        <Input
          placeholder="Buscar por DNI, nombres, apellidos o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            h-10
            border-slate-200
            bg-slate-50
            pl-10
            focus:bg-white
          "
        />
      </div>

      {/* ACCIONES */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-2

          md:w-auto
          md:flex-row
        "
      >
        <Button
          type="button"
          variant="outline"
          onClick={onImportarExcel}
          className="
            h-10
            w-full
            gap-2
            rounded-xl
            border-slate-200

            md:w-auto
          "
        >
          <FileSpreadsheet className="h-4 w-4" />
          Importar Excel
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onExportarExcel}
          disabled={exportando}
          className="
            h-10
            w-full
            gap-2
            rounded-xl
            border-slate-200

            md:w-auto
          "
        >
          <Download className="h-4 w-4" />

          {exportando ? "Exportando..." : "Exportar Excel"}
        </Button>

        <Button
          type="button"
          onClick={onNuevoAlumno}
          className="
            h-10
            w-full
            gap-2
            rounded-xl
            bg-blue-600
            px-4
            text-white
            hover:bg-blue-700

            md:w-auto
          "
        >
          <Plus className="h-4 w-4" />
          Nuevo alumno
        </Button>
      </div>
    </div>
  );
}
