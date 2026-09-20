"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    nombre: string;
    promedio: number;
  }[];
}

export default function PerformanceChart({ data }: Props) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Evolución del rendimiento</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="nombre" />

          <YAxis />

          <Tooltip />

          <Line type="monotone" dataKey="promedio" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
