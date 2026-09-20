"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, FileText, Plus, Search, UserX } from "lucide-react";

import Link from "next/link";

import { useParams } from "next/navigation";

import { api } from "@/lib/api";

import { Button, buttonVariants } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

interface Alumno {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  estado: boolean;
}

interface Carrera {
  id: number;
  nombre: string;
  estado: boolean;

  grupo: {
    id: number;
    codigo: string;
  };
}

interface Simulacro {
  id: number;
  numero: number;
  estado: string;

  ciclo: {
    id: number;
    nombre: string;
  };
}

interface Inscripcion {
  id: number;
  estado: boolean;

  alumno: Alumno;

  carrera: {
    id: number;
    nombre: string;
  };

  grupo: {
    id: number;
    codigo: string;
  };
}

export default function InscripcionesPage() {
  const params = useParams();

  const simulacroId = Number(params.id);

  const [simulacro, setSimulacro] = useState<Simulacro | null>(null);

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const [search, setSearch] = useState("");

  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [alumnoId, setAlumnoId] = useState("");

  const [carreraId, setCarreraId] = useState("");

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);

  async function cargarDatos() {
    try {
      const [
        simulacroResponse,
        inscripcionesResponse,
        alumnosResponse,
        carrerasResponse,
      ] = await Promise.all([
        api.get(`/simulacros/${simulacroId}`),

        api.get(`/inscripciones/simulacro/${simulacroId}`),

        api.get("/alumnos"),

        api.get("/carreras"),
      ]);

      setSimulacro(simulacroResponse.data);

      setInscripciones(inscripcionesResponse.data);

      setAlumnos(alumnosResponse.data);

      setCarreras(carrerasResponse.data);
    } catch (error) {
      console.error("Error cargando inscripciones", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (simulacroId) {
      cargarDatos();
    }
  }, [simulacroId]);

  async function registrarInscripcion() {
    try {
      setGuardando(true);
      setError("");

      if (!alumnoId || !carreraId) {
        setError("Selecciona un alumno y una carrera.");

        return;
      }

      await api.post("/inscripciones", {
        alumnoId: Number(alumnoId),

        simulacroId,

        carreraId: Number(carreraId),
      });

      setDialogAbierto(false);

      setAlumnoId("");
      setCarreraId("");

      await cargarDatos();
    } catch (error: any) {
      const mensaje = error.response?.data?.message;

      setError(
        Array.isArray(mensaje)
          ? mensaje.join(", ")
          : mensaje || "No se pudo registrar la inscripción.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function desactivar(inscripcion: Inscripcion) {
    const confirmar = window.confirm(
      `¿Deseas desactivar la inscripción de ${inscripcion.alumno.nombres} ${inscripcion.alumno.apellidos}?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.patch(`/inscripciones/${inscripcion.id}/desactivar`);

      await cargarDatos();
    } catch (error) {
      console.error("Error desactivando inscripción", error);
    }
  }

  async function abrirCarnet(inscripcionId: number) {
    try {
      setError("");

      const response = await api.get(
        `/carnets/inscripcion/${inscripcionId}/pdf`,
        {
          responseType: "blob",
        },
      );

      const pdf = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(pdf);

      const ventana = window.open(url, "_blank");

      if (!ventana) {
        URL.revokeObjectURL(url);

        setError(
          "El navegador bloqueó la apertura del carnet. Habilita las ventanas emergentes para SmartExam.",
        );

        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Error generando carnet", error);

      setError("No se pudo generar el carnet del alumno.");
    }
  }

  const inscripcionesFiltradas = inscripciones.filter((inscripcion) => {
    const texto = `${inscripcion.alumno.dni} ${inscripcion.alumno.nombres} ${
      inscripcion.alumno.apellidos
    } ${inscripcion.carrera.nombre} ${inscripcion.grupo.codigo}`.toLowerCase();

    return texto.includes(search.trim().toLowerCase());
  });

  const alumnosDisponibles = alumnos.filter(
    (alumno) =>
      alumno.estado &&
      !inscripciones.some((inscripcion) => inscripcion.alumno.id === alumno.id),
  );

  const carrerasActivas = carreras.filter((carrera) => carrera.estado);

  if (cargando) {
    return <div className="p-10">Cargando inscripciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/simulacros"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inscripciones</h1>

          {simulacro && (
            <p className="text-sm text-muted-foreground">
              Simulacro {simulacro.numero}
              {" · "}
              Ciclo {simulacro.ciclo.nombre}
            </p>
          )}
        </div>

        <Button
          onClick={() => {
            setError("");
            setDialogAbierto(true);
          }}
          disabled={simulacro?.estado === "FINALIZADO"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva inscripción
        </Button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar inscripción..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-4 text-left">DNI</th>

              <th className="p-4 text-left">Alumno</th>

              <th className="p-4 text-left">Carrera</th>

              <th className="p-4 text-left">Grupo</th>

              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {inscripcionesFiltradas.map((inscripcion) => (
              <tr key={inscripcion.id} className="border-b last:border-b-0">
                <td className="p-4">{inscripcion.alumno.dni}</td>

                <td className="p-4 font-medium">
                  {inscripcion.alumno.nombres} {inscripcion.alumno.apellidos}
                </td>

                <td className="p-4">{inscripcion.carrera.nombre}</td>

                <td className="p-4">{inscripcion.grupo.codigo}</td>

                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Generar carnet"
                      onClick={() => abrirCarnet(inscripcion.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      title="Desactivar inscripción"
                      onClick={() => desactivar(inscripcion)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {inscripcionesFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No se encontraron inscripciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva inscripción</DialogTitle>

            <DialogDescription>
              Selecciona el alumno y la carrera para este simulacro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alumno">Alumno</Label>

              <select
                id="alumno"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Seleccione un alumno</option>

                {alumnosDisponibles.map((alumno) => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.dni}
                    {" - "}
                    {alumno.nombres} {alumno.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrera">Carrera</Label>

              <select
                id="carrera"
                value={carreraId}
                onChange={(e) => setCarreraId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Seleccione una carrera</option>

                {carrerasActivas.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                    {" - Grupo "}
                    {carrera.grupo.codigo}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAbierto(false)}>
              Cancelar
            </Button>

            <Button onClick={registrarInscripcion} disabled={guardando}>
              {guardando ? "Registrando..." : "Registrar inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
