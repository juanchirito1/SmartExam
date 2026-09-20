interface Props {
  data: {
    puesto: number;
    alumno: string;
    carrera: string;
    puntaje: number;
  }[];
}

export default function RankingTable({ data }: Props) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Ranking del simulacro</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left">Puesto</th>

            <th className="text-left">Alumno</th>

            <th className="text-left">Carrera</th>

            <th className="text-left">Puntaje</th>
          </tr>
        </thead>

        <tbody>
          {(data ?? []).map((item) => (
            <tr key={item.puesto} className="border-b">
              <td>{item.puesto}</td>

              <td>{item.alumno}</td>

              <td>{item.carrera}</td>

              <td>{item.puntaje}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
