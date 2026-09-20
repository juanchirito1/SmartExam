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
      className="text-red-600 hover:text-red-700"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar sesión
    </Button>
  );
}
