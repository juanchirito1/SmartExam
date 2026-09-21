"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  onNuevo: () => void;
}

export default function UsuarioToolbar({ search, setSearch, onNuevo }: Props) {
  return (
    <div
      className="
        flex flex-col gap-4
        rounded-2xl
        border border-slate-200
        bg-white p-4 shadow-sm
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div className="relative w-full md:max-w-md">
        <Search
          className="
            absolute left-3 top-1/2
            h-4 w-4
            -translate-y-1/2
            text-slate-400
          "
        />

        <Input
          placeholder="Buscar por nombre, correo o rol..."
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

      <Button
        onClick={onNuevo}
        className="
          h-10 gap-2
          rounded-xl
          bg-blue-600
          px-4
          text-white
          hover:bg-blue-700
          w-full md:w-auto
        "
      >
        <Plus className="h-4 w-4" />
        Nuevo usuario
      </Button>
    </div>
  );
}
