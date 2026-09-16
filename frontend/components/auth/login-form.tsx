"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { guardarToken } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();

    console.log("intentando login", {
      correo,
      password,
    });

    try {
      setCargando(true);
      setError("");

      const respuesta = await api.post("/auth/login", {
        correo,
        password,
      });

      console.log("RESPUESTA LOGIN:", respuesta.data);

      const token = respuesta.data.accessToken;

      console.log("TOKEN:", token);

      guardarToken(token);

      router.push("/dashboard");
    } catch (error: any) {
      console.log("ERROR LOGIN:", error.response?.data || error.message);

      setError("Error en login");
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>SmartExam</CardTitle>

        <CardDescription>Ingresa al sistema académico</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={iniciarSesion} className="space-y-4">
          <div className="space-y-2">
            <Label>Correo</Label>

            <Input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@smartexam.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
