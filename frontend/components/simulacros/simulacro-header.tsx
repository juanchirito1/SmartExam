import { ClipboardList } from "lucide-react";

export default function SimulacroHeader() {
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
          bg-indigo-50
          text-indigo-600
        "
      >
        <ClipboardList className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-medium text-indigo-600">Evaluaciones</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Simulacros
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Configura y administra las evaluaciones académicas de SmartExam.
        </p>
      </div>
    </div>
  );
}
