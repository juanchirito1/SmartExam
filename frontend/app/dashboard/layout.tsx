import { ReactNode } from "react";

import AuthProvider from "@/components/auth/auth-provider";
import DashboardGuard from "@/components/auth/dashboard-guard";

import Sidebar from "@/components/dashboard/sidebar";
import LogoutButton from "@/components/dashboard/logout-button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>
        <div className="min-h-screen bg-slate-50">
          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <Sidebar />

          {/* ================================================= */}
          {/* CONTENIDO PRINCIPAL */}
          {/* ================================================= */}

          <div
            className="
              min-h-screen
              md:ml-64
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
              <div>
                <p className="font-semibold text-slate-900">
                  Panel Administrativo
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Sistema de evaluación académica
                </p>
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
