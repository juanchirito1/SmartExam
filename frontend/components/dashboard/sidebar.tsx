"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth/auth-provider";

import {
  ClipboardList,
  GraduationCap,
  Home,
  ScanLine,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { api } from "@/lib/api";

interface UsuarioActual {
  id: number;
  nombre: string;
  correo: string;

  rol: {
    id: number;
    nombre: string;
  };

  permisos: string[];
}

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

const navegacion = [
  {
    nombre: "Dashboard",
    href: "/dashboard",
    icono: Home,
    permiso: null,
  },
  {
    nombre: "Alumnos",
    href: "/dashboard/alumnos",
    icono: Users,
    permiso: "REGISTRAR_ALUMNOS",
  },
  {
    nombre: "Simulacros",
    href: "/dashboard/simulacros",
    icono: ClipboardList,
    permiso: "SIMULACROS",
  },
  {
    nombre: "Fichas OMR",
    href: "/dashboard/fichas",
    icono: ScanLine,
    permiso: "PROCESAR_FICHAS",
  },
  {
    nombre: "Resultados",
    href: "/dashboard/resultados",
    icono: Trophy,
    permiso: "VER_RESULTADOS",
  },
  {
    nombre: "Usuarios",
    href: "/dashboard/usuarios",
    icono: ShieldCheck,
    permiso: "GESTIONAR_USUARIOS",
  },
];

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const response = await api.get("/auth/me");

        setUsuario(response.data);
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    }

    cargarUsuario();
  }, []);

  function puedeVer(permiso: string | null) {
    if (!permiso) {
      return true;
    }

    if (!usuario) {
      return false;
    }

    if (permiso === "SIMULACROS") {
      return (
        usuario.permisos.includes("CREAR_SIMULACRO") ||
        usuario.permisos.includes("GENERAR_CARNETS")
      );
    }

    return usuario.permisos.includes(permiso);
  }

  function estaActivo(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* OVERLAY MÓVIL */}

      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onCerrar}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/50
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          border-slate-800
          bg-slate-950
          text-white
          transition-transform
          duration-300

          lg:translate-x-0

          ${abierto ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}

        <div
          className="
            flex
            h-20
            items-center
            justify-between
            border-b
            border-slate-800
            px-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
                shadow-lg
                shadow-blue-950/40
              "
            >
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="font-bold tracking-tight text-white">SmartExam</p>

              <p className="text-xs text-slate-400">Gestión académica</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              lg:hidden
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVEGACIÓN */}

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className="
              mb-3
              px-3
              text-[11px]
              font-semibold
              uppercase
              tracking-widest
              text-slate-500
            "
          >
            Navegación
          </p>

          <nav className="space-y-1">
            {navegacion
              .filter((item) => puedeVer(item.permiso))
              .map((item) => {
                const Icono = item.icono;

                const activo = estaActivo(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCerrar}
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-all

                      ${
                        activo
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-950/30"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }
                    `}
                  >
                    <Icono className="h-4 w-4 shrink-0" />

                    <span>{item.nombre}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* USUARIO */}

        {usuario && (
          <div
            className="
              border-t
              border-slate-800
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-slate-900
                p-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  text-sm
                  font-bold
                  text-white
                "
              >
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  {usuario.nombre}
                </p>

                <p
                  className="
                    truncate
                    text-xs
                    text-slate-500
                  "
                >
                  {usuario.rol.nombre}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
