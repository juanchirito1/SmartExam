"use client";

import { Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  onNuevoAlumno: () => void;
}

export default function AlumnoToolbar({
  search,
  setSearch,
  onNuevoAlumno,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Buscar alumno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Button onClick={onNuevoAlumno}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Alumno
      </Button>
    </div>
  );
}
