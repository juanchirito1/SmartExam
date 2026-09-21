"use client";

import { LogOut } from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  function cerrarSesion() {
    localStorage.removeItem("token");

    router.replace("/login");

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={cerrarSesion}
      className="
        gap-2
        text-slate-500
        hover:bg-red-50
        hover:text-red-600
      "
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </Button>
  );
}
