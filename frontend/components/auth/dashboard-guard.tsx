"use client";

import { ReactNode, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { api } from "@/lib/api";

interface Perfil {
  id: number;
  nombre: string;
  correo: string;

  rol: {
    id: number;
    nombre: string;
  };

  permisos: string[];
}

interface Props {
  children: ReactNode;
}

export default function DashboardGuard({ children }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const [autorizado, setAutorizado] = useState(false);

  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");

        return;
      }

      try {
        const response = await api.get("/auth/me");

        const perfil: Perfil = response.data;

        const permisos = perfil.permisos;

        let tieneAcceso = true;

        /*
         * Usuarios
         */
        if (pathname.startsWith("/dashboard/usuarios")) {
          tieneAcceso = permisos.includes("GESTIONAR_USUARIOS");
        } else if (pathname.includes("/clave")) {

        /*
         * Clave de respuestas
         */
          tieneAcceso = permisos.includes("CREAR_SIMULACRO");
        } else if (pathname.includes("/inscripciones")) {

        /*
         * Inscripciones y carnets
         */
          tieneAcceso = permisos.includes("GENERAR_CARNETS");
        } else if (pathname.startsWith("/dashboard/fichas")) {

        /*
         * Fichas OMR
         */
          tieneAcceso = permisos.includes("PROCESAR_FICHAS");
        } else if (pathname.startsWith("/dashboard/resultados")) {

        /*
         * Resultados
         */
          tieneAcceso = permisos.includes("VER_RESULTADOS");
        } else if (pathname.startsWith("/dashboard/alumnos")) {

        /*
         * Alumnos
         */
          tieneAcceso = permisos.includes("REGISTRAR_ALUMNOS");
        } else if (pathname.startsWith("/dashboard/simulacros")) {

        /*
         * Simulacros
         */
          tieneAcceso =
            permisos.includes("CREAR_SIMULACRO") ||
            permisos.includes("GENERAR_CARNETS");
        }

        if (!tieneAcceso) {
          router.replace("/dashboard");

          return;
        }

        setAutorizado(true);
      } catch (error: any) {
        const status = error.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");

          router.replace("/login");

          return;
        }

        console.error("Error verificando acceso", error);
      } finally {
        setVerificando(false);
      }
    }

    verificar();
  }, [pathname, router]);

  if (verificando || !autorizado) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return children;
}
