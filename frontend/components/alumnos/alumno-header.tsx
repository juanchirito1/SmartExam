"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AlumnoHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Alumnos</h2>

        <p className="text-sm text-muted-foreground">
          Administra los alumnos registrados en SmartExam
        </p>
      </div>

    </div>
  );
}
