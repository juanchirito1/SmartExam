import { Users } from "lucide-react";

export default function AlumnoHeader() {
  return (
    <div className="flex items-start gap-4">
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
        "
      >
        <Users className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-medium text-blue-600">Gestión académica</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Alumnos
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Administra la información de los alumnos registrados en SmartExam.
        </p>
      </div>
    </div>
  );
}
