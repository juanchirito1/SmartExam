"use client";

import { ReactNode, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

interface Props {
  children: ReactNode;
}

function tieneAcceso(pathname: string, permisos: string[]) {
  // =========================================================
  // USUARIOS
  // =========================================================

  if (pathname.startsWith("/dashboard/usuarios")) {
    return permisos.includes("GESTIONAR_USUARIOS");
  }

  // =========================================================
  // CLAVE DE RESPUESTAS
  // =========================================================

  if (pathname.includes("/clave")) {
    return permisos.includes("CREAR_SIMULACRO");
  }

  // =========================================================
  // INSCRIPCIONES
  // =========================================================

  if (pathname.includes("/inscripciones")) {
    return (
      permisos.includes("GENERAR_CARNETS") ||
      permisos.includes("GESTIONAR_INSCRIPCIONES")
    );
  }

  // =========================================================
  // FICHAS OMR
  // =========================================================

  if (pathname.startsWith("/dashboard/fichas")) {
    return permisos.includes("PROCESAR_FICHAS");
  }

  // =========================================================
  // RESULTADOS
  // =========================================================

  if (pathname.startsWith("/dashboard/resultados")) {
    return permisos.includes("VER_RESULTADOS");
  }

  // =========================================================
  // ALUMNOS
  // =========================================================

  if (pathname.startsWith("/dashboard/alumnos")) {
    return permisos.includes("REGISTRAR_ALUMNOS");
  }

  // =========================================================
  // SIMULACROS
  // =========================================================

  if (pathname === "/dashboard/simulacros") {
    return (
      permisos.includes("CREAR_SIMULACRO") ||
      permisos.includes("GENERAR_CARNETS") ||
      permisos.includes("GESTIONAR_INSCRIPCIONES")
    );
  }

  // Dashboard principal.
  return true;
}

export default function DashboardGuard({ children }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const { usuario, permisos, cargando } = useAuth();

  useEffect(() => {
    if (cargando) {
      return;
    }

    /*
      No hay sesión.
    */

    if (!usuario) {
      router.replace("/login");

      return;
    }

    /*
      Tiene sesión pero no autorización
      para esta ruta.
    */

    if (!tieneAcceso(pathname, permisos)) {
      router.replace("/dashboard");
    }
  }, [cargando, usuario, permisos, pathname, router]);

  if (cargando) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-7
              w-7
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-blue-600
            "
          />

          <p className="mt-3 text-sm text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  if (!tieneAcceso(pathname, permisos)) {
    return null;
  }

  return children;
}
