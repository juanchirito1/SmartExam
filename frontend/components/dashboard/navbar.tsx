export default function Navbar(){

  return (
    <header className="h-16 border-b flex items-center justify-between px-6">

      <h2 className="font-semibold">
        Panel Administrativo
      </h2>


      <button
        className="text-sm text-red-600"
      >
        Cerrar sesión
      </button>

    </header>
  );
}