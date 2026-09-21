"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StatCard from "@/components/dashboard/stat-card";
import PerformanceChart from "@/components/dashboard/performance-chart";
import AreaChartDashboard from "@/components/dashboard/area-chart";
import RankingTable from "@/components/dashboard/ranking-table";

import {
  Users,
  ClipboardList,
  ScanLine,
  TrendingUp,
} from "lucide-react";

interface Resumen {
  totalAlumnos: number;
  totalSimulacros: number;
  fichasProcesadas: number;
  promedioGeneral: number;
}

interface Ranking {
  puesto: number;
  alumno: string;
  carrera: string;
  puntaje: number;
}

interface Area {
  area: string;
  rendimiento: number;
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);

  const [ranking, setRanking] = useState<Ranking[]>([]);

  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    async function cargar() {
      try {
        const [resumenResponse, rankingResponse, areasResponse] =
          await Promise.all([
            api.get("/dashboard/resumen"),

            api.get("/dashboard/ranking/1"),

            api.get("/dashboard/rendimiento-area/1"),
          ]);

        setResumen(resumenResponse.data);

        const rankingData = Array.isArray(rankingResponse.data)
          ? rankingResponse.data
          : (rankingResponse.data.ranking ?? []);

        const areasData = Array.isArray(areasResponse.data)
          ? areasResponse.data
          : (areasResponse.data.areas ?? []);

        setRanking(rankingData);

        console.log("RESPUESTA AREAS:", areasData);

        setAreas(areasData);
      } catch (error) {
        console.error("Error dashboard", error);
      }
    }

    cargar();
  }, []);

  if (!resumen) {
    return <div className="p-10">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard SmartExam</h1>

        <p className="text-muted-foreground">Resumen académico general</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Total alumnos"
          value={resumen.totalAlumnos}
          description="Alumnos registrados"
          icon={Users}
        />

        <StatCard
          title="Simulacros"
          value={resumen.totalSimulacros}
          description="Evaluaciones registradas"
          icon={ClipboardList}
        />

        <StatCard
          title="Fichas procesadas"
          value={resumen.fichasProcesadas}
          description="Lecturas OMR completadas"
          icon={ScanLine}
        />

        <StatCard
          title="Promedio general"
          value={resumen.promedioGeneral}
          description="Rendimiento acumulado"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PerformanceChart
          data={[
            {
              nombre: "Simulacro 1",
              promedio: resumen.promedioGeneral,
            },
          ]}
        />

        <AreaChartDashboard data={areas} />
      </div>

      <RankingTable data={ranking} />
    </div>
  );
}
