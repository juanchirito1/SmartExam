"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    area: string;
    rendimiento: number;
  }[];
}

export default function AreaChartDashboard({ data }: Props) {
  const dataFormateada = data.map((item) => {
    let nombreCorto = item.area;

    switch (item.area) {
      case "Comunicación en lengua materna":
        nombreCorto = "Comunicación";
        break;

      case "Matemática razonada":
        nombreCorto = "Matemática";
        break;

      case "Ciencia, tecnología y ambiente":
        nombreCorto = "Ciencia";
        break;

      case "Ciencias sociales, persona y relaciones humanas":
        nombreCorto = "Sociales";
        break;
    }

    return {
      ...item,
      areaCorta: nombreCorto,
    };
  });

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Rendimiento por área</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={dataFormateada}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="areaCorta" />

          <YAxis />

          <Tooltip
            formatter={(value) => [value, "Rendimiento"]}
            labelFormatter={(label) => {
              if (!label) return "";

              const texto = String(label).replace("...", "");

              const original = data.find((x) => x.area.startsWith(texto));

              return original?.area ?? label;
            }}
          />

          <Bar dataKey="rendimiento" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
