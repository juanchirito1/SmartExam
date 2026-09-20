"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ClipboardList,
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { usePathname } from "next/navigation";

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

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;

  permiso?: string;

  permisosCualquiera?: string[];
}

const menu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Alumnos",
    href: "/dashboard/alumnos",
    icon: Users,
    permiso: "REGISTRAR_ALUMNOS",
  },

  {
    label: "Simulacros",
    href: "/dashboard/simulacros",
    icon: ClipboardList,

    permisosCualquiera: ["CREAR_SIMULACRO", "GENERAR_CARNETS"],
  },

  {
    label: "Fichas OMR",
    href: "/dashboard/fichas",
    icon: ScanLine,
    permiso: "PROCESAR_FICHAS",
  },

  {
    label: "Resultados",
    href: "/dashboard/resultados",
    icon: Trophy,
    permiso: "VER_RESULTADOS",
  },

  {
    label: "Usuarios",
    href: "/dashboard/usuarios",
    icon: ShieldCheck,
    permiso: "GESTIONAR_USUARIOS",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const response = await api.get("/auth/me");

        setPerfil(response.data);
      } catch (error) {
        console.error("Error cargando permisos", error);
      }
    }

    cargarPerfil();
  }, []);

  function tieneAcceso(item: MenuItem) {
    if (!item.permiso && !item.permisosCualquiera) {
      return true;
    }

    if (!perfil) {
      return false;
    }

    if (item.permiso) {
      return perfil.permisos.includes(item.permiso);
    }

    if (item.permisosCualquiera) {
      return item.permisosCualquiera.some((permiso) =>
        perfil.permisos.includes(permiso),
      );
    }

    return false;
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">SmartExam</h1>

        {perfil && (
          <p className="mt-1 text-xs text-muted-foreground">
            {perfil.rol.nombre}
          </p>
        )}
      </div>

      <nav className="space-y-1">
        {menu.filter(tieneAcceso).map((item) => {
          const Icon = item.icon;

          const activo =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                  flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors

                  ${activo ? "bg-muted font-medium" : "hover:bg-muted/60"}
                `}
            >
              <Icon className="h-4 w-4" />

              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
