"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";

import AuthProvider from "@/components/auth/auth-provider";
import DashboardGuard from "@/components/auth/dashboard-guard";

import Sidebar from "@/components/dashboard/sidebar";
import LogoutButton from "@/components/dashboard/logout-button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <AuthProvider>
      <DashboardGuard>
        <div className="min-h-screen bg-slate-50">
          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <Sidebar
            abierto={sidebarAbierto}
            onCerrar={() => setSidebarAbierto(false)}
          />

          {/* ================================================= */}
          {/* CONTENIDO PRINCIPAL */}
          {/* ================================================= */}

          <div
            className="
              min-h-screen
              lg:ml-64
            "
          >
            {/* =============================================== */}
            {/* HEADER */}
            {/* =============================================== */}

            <header
              className="
                sticky
                top-0
                z-30
                flex
                h-20
                items-center
                justify-between
                border-b
                border-slate-200
                bg-white/95
                px-4
                backdrop-blur
                sm:px-6
                lg:px-8
              "
            >
              <div className="flex items-center gap-3">
                {/* BOTÓN MENÚ MÓVIL */}

                <button
                  type="button"
                  onClick={() => setSidebarAbierto(true)}
                  aria-label="Abrir menú"
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                    lg:hidden
                  "
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <p className="font-semibold text-slate-900">
                    Panel Administrativo
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Sistema de evaluación académica
                  </p>
                </div>
              </div>

              <LogoutButton />
            </header>

            {/* =============================================== */}
            {/* PÁGINA */}
            {/* =============================================== */}

            <main
              className="
                mx-auto
                w-full
                max-w-[1600px]
                p-4
                sm:p-6
                lg:p-8
              "
            >
              {children}
            </main>
          </div>
        </div>
      </DashboardGuard>
    </AuthProvider>
  );
}
