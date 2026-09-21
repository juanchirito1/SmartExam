import { ShieldCheck } from "lucide-react";

export default function UsuarioHeader() {
  return (
    <div className="flex items-start gap-4">
      <div
        className="
          flex h-12 w-12 shrink-0
          items-center justify-center
          rounded-2xl
          bg-sky-50
          text-sky-600
        "
      >
        <ShieldCheck className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-medium text-sky-600">Administración</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Usuarios
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Administra las cuentas, roles y accesos al sistema SmartExam.
        </p>
      </div>
    </div>
  );
}
