import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r bg-white p-5">

      <h1 className="text-2xl font-bold mb-8">
        SmartExam
      </h1>


      <nav className="space-y-3">

        <Link
          href="/dashboard"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Dashboard
        </Link>


        <Link
          href="/dashboard/alumnos"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Alumnos
        </Link>


        <Link
          href="/dashboard/simulacros"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Simulacros
        </Link>


        <Link
          href="/dashboard/fichas"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Fichas OMR
        </Link>


        <Link
          href="/dashboard/resultados"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Resultados
        </Link>


        <Link
          href="/dashboard/usuarios"
          className="block rounded-md p-2 hover:bg-gray-100"
        >
          Usuarios
        </Link>

      </nav>

    </aside>
  );
}