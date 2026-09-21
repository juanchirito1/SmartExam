"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Item {
  area: string;
  rendimiento: number;
}

interface Props {
  data: Item[];
}

function nombreCorto(nombre: string) {
  const texto = nombre.toLowerCase();

  if (texto.includes("comunicación")) {
    return "Comunicación";
  }

  if (texto.includes("matemática")) {
    return "Matemática";
  }

  if (texto.includes("ciencia")) {
    return "Ciencia";
  }

  if (texto.includes("social")) {
    return "Sociales";
  }

  return nombre;
}

export default function AreaChartDashboard({ data }: Props) {
  const chartData = Array.isArray(data)
    ? data.map((item) => ({
        ...item,
        areaCorta: nombreCorto(item.area),
      }))
    : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Rendimiento por área
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Comparación de desempeño académico
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="areaCorta"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 20px rgba(15,23,42,.08)",
            }}
            formatter={(value) => [value, "Rendimiento"]}
          />

          <Bar
            dataKey="rendimiento"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
            maxBarSize={75}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
