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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Button onClick={onNuevo}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Usuario
      </Button>
    </div>
  );
}
