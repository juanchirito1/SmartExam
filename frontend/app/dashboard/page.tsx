"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import StatCard from "@/components/dashboard/stat-card";

interface ResumenDashboard {
  totalAlumnos: number;
  totalSimulacros: number;
  fichasProcesadas: number;
  promedioGeneral: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] =
    useState<ResumenDashboard | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function cargarResumen() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await api.get(
          "/dashboard/resumen",
        );

        setData(respuesta.data);
      } catch (error: any) {
        console.error(
          "Error cargando dashboard:",
          error,
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setError(
          "No se pudo cargar la información del dashboard.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarResumen();
  }, [router]);

  if (cargando) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard SmartExam
        </h1>

        <p className="mt-4 text-muted-foreground">
          Cargando información...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard SmartExam
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard SmartExam
        </h1>

        <p className="mt-2 text-muted-foreground">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total alumnos"
          value={data.totalAlumnos}
        />

        <StatCard
          title="Simulacros"
          value={data.totalSimulacros}
        />

        <StatCard
          title="Fichas procesadas"
          value={data.fichasProcesadas}
        />

        <StatCard
          title="Promedio general"
          value={data.promedioGeneral}
        />
      </div>
    </div>
  );
}