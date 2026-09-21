"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const response = await api.post("/auth/login", {
        correo,
        password,
      });

      localStorage.setItem("token", response.data.accessToken);

      router.replace("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "No se pudo iniciar sesión. Verifica tus credenciales.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      {/* ===================================================== */}
      {/* LADO INSTITUCIONAL */}
      {/* ===================================================== */}

      <section
        className="
          relative
          hidden
          overflow-hidden
          bg-slate-950
          lg:flex
          lg:min-h-screen
          lg:flex-col
          lg:justify-between
          lg:p-12
        "
      >
        {/* DECORACIÓN */}

        <div
          className="
            absolute
            -left-32
            top-1/3
            h-96
            w-96
            rounded-full
            bg-blue-600/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-24
            top-0
            h-80
            w-80
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />

        {/* LOGO */}

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-blue-600
                text-white
                shadow-lg
                shadow-blue-950/40
              "
            >
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-white">
                SmartExam
              </p>

              <p className="text-sm text-slate-400">
                Gestión académica inteligente
              </p>
            </div>
          </div>
        </div>

        {/* MENSAJE PRINCIPAL */}

        <div className="relative z-10 max-w-xl">
          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-500/20
              bg-blue-500/10
              px-3
              py-1.5
              text-sm
              font-medium
              text-blue-300
            "
          >
            <ShieldCheck className="h-4 w-4" />
            Plataforma de evaluación académica
          </div>

          <h1
            className="
              text-5xl
              font-bold
              leading-tight
              tracking-tight
              text-white
            "
          >
            Evaluaciones más rápidas, precisas y organizadas.
          </h1>

          <p
            className="
              mt-6
              max-w-lg
              text-lg
              leading-8
              text-slate-400
            "
          >
            Gestiona alumnos, simulacros, inscripciones, fichas OMR y resultados
            desde una sola plataforma.
          </p>

          {/* MINI FEATURES */}

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-4
              "
            >
              <p className="text-sm font-semibold text-white">Lectura OMR</p>

              <p className="mt-1 text-sm text-slate-400">
                Procesamiento automático de fichas.
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-4
              "
            >
              <p className="text-sm font-semibold text-white">Resultados</p>

              <p className="mt-1 text-sm text-slate-400">
                Calificación y ranking inmediato.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <p className="relative z-10 text-xs text-slate-500">
          SmartExam · Sistema de gestión de simulacros académicos
        </p>
      </section>

      {/* ===================================================== */}
      {/* LOGIN */}
      {/* ===================================================== */}

      <section
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-6
          py-12
          sm:px-10
        "
      >
        <div className="w-full max-w-md">
          {/* LOGO MÓVIL */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
              "
            >
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold text-slate-900">SmartExam</p>

              <p className="text-xs text-slate-500">Gestión académica</p>
            </div>
          </div>

          {/* CABECERA */}

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Acceso administrativo
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Bienvenido a SmartExam
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ingresa tus credenciales para acceder al panel de gestión.
            </p>
          </div>

          {/* FORMULARIO */}

          <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
            {/* CORREO */}

            <div className="space-y-2">
              <Label htmlFor="correo" className="text-slate-700">
                Correo electrónico
              </Label>

              <div className="relative">
                <Mail
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
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@smartexam.com"
                  autoComplete="email"
                  required
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    bg-white
                    pl-10
                  "
                />
              </div>
            </div>

            {/* CONTRASEÑA */}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>

              <div className="relative">
                <KeyRound
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
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  className="
                    h-11
                    rounded-xl
                    border-slate-200
                    bg-white
                    pl-10
                  "
                />
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            {/* BOTÓN */}

            <Button
              type="submit"
              disabled={cargando}
              className="
                h-11
                w-full
                rounded-xl
                bg-blue-600
                font-semibold
                text-white
                shadow-sm
                hover:bg-blue-700
              "
            >
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* INFORMACIÓN */}

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
            "
          >
            <div className="flex gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Acceso protegido
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-400">
                  Las funciones disponibles dependen del rol y los permisos
                  asignados a cada usuario.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            SmartExam · Plataforma de evaluación académica
          </p>
        </div>
      </section>
    </main>
  );
}
