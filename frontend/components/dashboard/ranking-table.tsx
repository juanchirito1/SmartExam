import { Medal, Trophy } from "lucide-react";

interface Ranking {
  puesto: number;
  alumno: string;
  dni?: string;
  carrera: string;
  grupo?: string;
  puntaje: number;
}

interface Props {
  data: Ranking[];
}

export default function RankingTable({ data }: Props) {
  const ranking = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Ranking del simulacro
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mejores resultados obtenidos
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Trophy className="h-5 w-5" />
        </div>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {data.map((item) => (
          <div
            key={`${item.puesto}-${item.dni ?? item.alumno}`}
            className="flex items-center gap-3 p-4"
          >
            <div
              className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-sm
          font-bold

          ${
            item.puesto === 1
              ? "bg-amber-50 text-amber-700"
              : item.puesto === 2
                ? "bg-slate-100 text-slate-600"
                : item.puesto === 3
                  ? "bg-orange-50 text-orange-700"
                  : "bg-slate-50 text-slate-600"
          }
        `}
            >
              {item.puesto}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">
                {item.alumno}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {item.carrera}
                {item.grupo ? ` · Grupo ${item.grupo}` : ""}
              </p>
            </div>

            <span
              className="
          shrink-0
          rounded-xl
          bg-blue-50
          px-3
          py-1.5
          text-sm
          font-bold
          text-blue-700
        "
            >
              {item.puntaje}
            </span>
          </div>
        ))}

        {data.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">
              Sin resultados procesados
            </p>
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Puesto
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Alumno
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Carrera
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Puntaje
              </th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((item) => (
              <tr
                key={`${item.puesto}-${item.alumno}`}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.puesto <= 3 && (
                      <Medal className="h-4 w-4 text-amber-500" />
                    )}

                    <span className="font-semibold text-slate-900">
                      {item.puesto}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{item.alumno}</p>

                  {item.dni && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      DNI {item.dni}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.carrera}
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {item.puntaje}
                  </span>
                </td>
              </tr>
            ))}

            {ranking.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  Aún no existen resultados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
