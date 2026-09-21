"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  FileText,
  Mail,
  Plus,
  Search,
  Share2,
  UserX,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import { useParams } from "next/navigation";

import { api } from "@/lib/api";

import { useAuth } from "@/components/auth/auth-provider";

import { Button } from "@/components/ui/button";

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

  /*
    Ahora los permisos vienen del AuthProvider.

    Ya no ejecutamos otro GET /auth/me
    desde esta página.
  */

  const { permisos } = useAuth();

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

  const [enviandoCorreoId, setEnviandoCorreoId] = useState<number | null>(null);

  const [compartiendoWhatsappId, setCompartiendoWhatsappId] = useState<
    number | null
  >(null);

  const [mensajeCorreo, setMensajeCorreo] = useState("");

  const [errorCorreo, setErrorCorreo] = useState("");

  // =========================================================
  // CARGAR DATOS
  // =========================================================

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

  // =========================================================
  // REGISTRAR
  // =========================================================

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

  // =========================================================
  // DESACTIVAR
  // =========================================================

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

  // =========================================================
  // ABRIR CARNET
  // =========================================================

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

  // =========================================================
  // CORREO
  // =========================================================

  async function enviarCarnetCorreo(inscripcionId: number) {
    setEnviandoCorreoId(inscripcionId);

    setMensajeCorreo("");
    setErrorCorreo("");

    try {
      const response = await api.post(
        `/carnets/inscripcion/${inscripcionId}/enviar-correo`,
      );

      setMensajeCorreo(
        response.data.mensaje || "Carnet enviado correctamente por correo.",
      );
    } catch (error: any) {
      setErrorCorreo(
        error?.response?.data?.message ||
          "No se pudo enviar el carnet por correo.",
      );
    } finally {
      setEnviandoCorreoId(null);
    }
  }

  // =========================================================
  // WHATSAPP
  // =========================================================

  async function compartirCarnetWhatsApp(inscripcionId: number) {
    setCompartiendoWhatsappId(inscripcionId);

    setErrorCorreo("");
    setMensajeCorreo("");

    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    /*
      En escritorio abrimos una pestaña
      inmediatamente para evitar bloqueo
      de ventanas emergentes.
    */

    const ventanaWhatsApp = !esMovil ? window.open("", "_blank") : null;

    try {
      const datosResponse = await api.get(
        `/carnets/inscripcion/${inscripcionId}/whatsapp`,
      );

      const datos = datosResponse.data;

      const urlWhatsApp = `https://wa.me/${datos.telefono}?text=${encodeURIComponent(
        datos.mensaje,
      )}`;

      // =====================================================
      // PC
      // =====================================================

      if (!esMovil) {
        if (ventanaWhatsApp) {
          ventanaWhatsApp.location.href = urlWhatsApp;
        } else {
          window.location.href = urlWhatsApp;
        }

        setMensajeCorreo(
          "WhatsApp Web abierto con el mensaje del postulante preparado.",
        );

        return;
      }

      // =====================================================
      // MÓVIL
      // =====================================================

      try {
        const pdfResponse = await api.get(
          `/carnets/inscripcion/${inscripcionId}/pdf`,
          {
            responseType: "blob",
          },
        );

        const archivo = new File([pdfResponse.data], datos.nombreArchivo, {
          type: "application/pdf",
        });

        if (
          navigator.share &&
          navigator.canShare?.({
            files: [archivo],
          })
        ) {
          await navigator.share({
            title: "Carnet de postulante",

            text: datos.mensaje,

            files: [archivo],
          });

          setMensajeCorreo("Carnet preparado para compartir correctamente.");

          return;
        }
      } catch (shareError: any) {
        if (shareError?.name === "AbortError") {
          return;
        }

        console.warn(
          "No fue posible compartir el PDF directamente:",
          shareError,
        );
      }

      /*
        Fallback móvil.
      */

      window.location.href = urlWhatsApp;

      setMensajeCorreo(
        "WhatsApp abierto con el mensaje del postulante preparado.",
      );
    } catch (error: any) {
      if (ventanaWhatsApp && !ventanaWhatsApp.closed) {
        ventanaWhatsApp.close();
      }

      console.error("Error preparando WhatsApp:", error);

      setErrorCorreo(
        error?.response?.data?.message ||
          "No se pudo preparar el carnet para WhatsApp.",
      );
    } finally {
      setCompartiendoWhatsappId(null);
    }
  }

  // =========================================================
  // FILTROS
  // =========================================================

  const inscripcionesFiltradas = inscripciones.filter((inscripcion) => {
    const texto =
      `${inscripcion.alumno.dni} ${inscripcion.alumno.nombres} ${inscripcion.alumno.apellidos} ${inscripcion.carrera.nombre} ${inscripcion.grupo.codigo}`.toLowerCase();

    return texto.includes(search.trim().toLowerCase());
  });

  const alumnosDisponibles = alumnos.filter(
    (alumno) =>
      alumno.estado &&
      !inscripciones.some((inscripcion) => inscripcion.alumno.id === alumno.id),
  );

  const carrerasActivas = carreras.filter((carrera) => carrera.estado);

  const totalInscripciones = inscripciones.length;

  const inscripcionesActivas = inscripciones.filter(
    (inscripcion) => inscripcion.estado,
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* =================================================== */}
      {/* ENCABEZADO */}
      {/* =================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-indigo-50
              text-indigo-600
            "
          >
            <UsersRound className="h-6 w-6" />
          </div>

          <div>
            <Link
              href="/dashboard/simulacros"
              className="
                mb-2
                inline-flex
                items-center
                gap-1
                text-sm
                font-medium
                text-slate-500
                hover:text-blue-600
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a simulacros
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Inscripciones
            </h1>

            {simulacro && (
              <p className="mt-1 text-sm text-slate-500">
                Simulacro {simulacro.numero}
                <span className="mx-2 text-slate-300">·</span>
                Ciclo {simulacro.ciclo.nombre}
                <span className="mx-2 text-slate-300">·</span>
                Estado {simulacro.estado}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => {
            setError("");
            setDialogAbierto(true);
          }}
          disabled={simulacro?.estado === "FINALIZADO"}
          className="
            h-10
            w-full
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            text-white
            hover:bg-blue-700

            sm:w-auto
          "
        >
          <Plus className="h-4 w-4" />
          Nueva inscripción
        </Button>
      </div>

      {/* =================================================== */}
      {/* RESUMEN */}
      {/* =================================================== */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inscripciones registradas</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalInscripciones}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inscripciones activas</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <p className="text-3xl font-bold text-slate-900">
              {inscripcionesActivas}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================== */}
      {/* BUSCADOR */}
      {/* =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
          />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, alumno, carrera o grupo..."
            className="
              h-10
              border-slate-200
              bg-slate-50
              pl-10
              focus:bg-white
            "
          />
        </div>
      </div>

      {/* =================================================== */}
      {/* MENSAJES */}
      {/* =================================================== */}

      {mensajeCorreo && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {mensajeCorreo}
        </div>
      )}

      {errorCorreo && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorCorreo}
        </div>
      )}

      {/* =================================================== */}
      {/* LISTADO */}
      {/* =================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Postulantes inscritos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {inscripcionesFiltradas.length} registro
            {inscripcionesFiltradas.length !== 1 ? "s" : ""} encontrado
            {inscripcionesFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ================================================= */}
        {/* MÓVIL */}
        {/* ================================================= */}

        <div className="divide-y divide-slate-100 md:hidden">
          {inscripcionesFiltradas.map((inscripcion) => (
            <div key={inscripcion.id} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-50
                        font-semibold
                        text-indigo-700
                      "
                  >
                    {inscripcion.alumno.nombres.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {inscripcion.alumno.nombres}{" "}
                      {inscripcion.alumno.apellidos}
                    </p>

                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      DNI {inscripcion.alumno.dni}
                    </p>
                  </div>
                </div>

                <span
                  className={`
                      inline-flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      px-2.5
                      py-1
                      text-xs
                      font-semibold

                      ${
                        inscripcion.estado
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }
                    `}
                >
                  <span
                    className={`
                        h-1.5
                        w-1.5
                        rounded-full

                        ${inscripcion.estado ? "bg-emerald-500" : "bg-red-500"}
                      `}
                  />

                  {inscripcion.estado ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="grid gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-slate-400">Carrera</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {inscripcion.carrera.nombre}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Grupo</p>

                  <span
                    className="
                        mt-1
                        inline-flex
                        h-8
                        min-w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-50
                        px-2
                        text-sm
                        font-bold
                        text-blue-700
                      "
                  >
                    {inscripcion.grupo.codigo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => abrirCarnet(inscripcion.id)}
                  className="gap-2 rounded-xl border-slate-200"
                >
                  <FileText className="h-4 w-4" />
                  Carnet
                </Button>

                {permisos.includes("ENVIAR_CARNET_CORREO") && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={enviandoCorreoId === inscripcion.id}
                    onClick={() => enviarCarnetCorreo(inscripcion.id)}
                    className="
                        gap-2
                        rounded-xl
                        border-emerald-200
                        text-emerald-700
                        hover:bg-emerald-50
                      "
                  >
                    <Mail className="h-4 w-4" />

                    {enviandoCorreoId === inscripcion.id
                      ? "Enviando..."
                      : "Correo"}
                  </Button>
                )}

                {permisos.includes("ENVIAR_CARNET_WHATSAPP") && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={compartiendoWhatsappId === inscripcion.id}
                    onClick={() => compartirCarnetWhatsApp(inscripcion.id)}
                    className="
                        gap-2
                        rounded-xl
                        border-emerald-200
                        text-emerald-700
                        hover:bg-emerald-50
                      "
                  >
                    <Share2 className="h-4 w-4" />

                    {compartiendoWhatsappId === inscripcion.id
                      ? "Preparando..."
                      : "WhatsApp"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  disabled={!inscripcion.estado}
                  onClick={() => desactivar(inscripcion)}
                  className="
                      gap-2
                      rounded-xl
                      border-slate-200
                      text-red-600
                      hover:bg-red-50
                      disabled:text-slate-300
                    "
                >
                  <UserX className="h-4 w-4" />
                  Desactivar
                </Button>
              </div>
            </div>
          ))}

          {inscripcionesFiltradas.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-medium text-slate-700">
                No se encontraron inscripciones
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Registra un postulante o modifica el criterio de búsqueda.
              </p>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* DESKTOP */}
        {/* ================================================= */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  DNI
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alumno
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Carrera
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Grupo
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {inscripcionesFiltradas.map((inscripcion) => (
                <tr
                  key={inscripcion.id}
                  className="
                      border-b
                      border-slate-100
                      last:border-0
                      hover:bg-slate-50/70
                    "
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-slate-700">
                      {inscripcion.alumno.dni}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-50
                            text-sm
                            font-semibold
                            text-indigo-700
                          "
                      >
                        {inscripcion.alumno.nombres.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {inscripcion.alumno.nombres}{" "}
                          {inscripcion.alumno.apellidos}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Postulante
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {inscripcion.carrera.nombre}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className="
                          inline-flex
                          h-8
                          min-w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-blue-50
                          px-2
                          text-sm
                          font-bold
                          text-blue-700
                        "
                    >
                      {inscripcion.grupo.codigo}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-semibold

                          ${
                            inscripcion.estado
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }
                        `}
                    >
                      <span
                        className={`
                            h-1.5
                            w-1.5
                            rounded-full

                            ${
                              inscripcion.estado
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }
                          `}
                      />

                      {inscripcion.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Generar carnet"
                        onClick={() => abrirCarnet(inscripcion.id)}
                        className="
                            rounded-lg
                            border-slate-200
                            text-slate-600
                            hover:bg-blue-50
                            hover:text-blue-600
                          "
                      >
                        <FileText className="h-4 w-4" />
                      </Button>

                      {permisos.includes("ENVIAR_CARNET_CORREO") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Enviar carnet por correo"
                          disabled={enviandoCorreoId === inscripcion.id}
                          onClick={() => enviarCarnetCorreo(inscripcion.id)}
                          className="
                              rounded-lg
                              border-slate-200
                              text-slate-600
                              hover:bg-emerald-50
                              hover:text-emerald-600
                            "
                        >
                          {enviandoCorreoId === inscripcion.id ? (
                            <span
                              className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-slate-300
                                  border-t-emerald-600
                                "
                            />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {permisos.includes("ENVIAR_CARNET_WHATSAPP") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Compartir carnet por WhatsApp"
                          disabled={compartiendoWhatsappId === inscripcion.id}
                          onClick={() =>
                            compartirCarnetWhatsApp(inscripcion.id)
                          }
                          className="
                              rounded-lg
                              border-slate-200
                              text-slate-600
                              hover:bg-emerald-50
                              hover:text-emerald-600
                            "
                        >
                          {compartiendoWhatsappId === inscripcion.id ? (
                            <span
                              className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-slate-300
                                  border-t-emerald-600
                                "
                            />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        title="Desactivar inscripción"
                        disabled={!inscripcion.estado}
                        onClick={() => desactivar(inscripcion)}
                        className="
                            rounded-lg
                            border-slate-200
                            text-slate-600
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:text-slate-300
                          "
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {inscripcionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="font-medium text-slate-700">
                      No se encontraron inscripciones
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Registra un postulante o modifica el criterio de búsqueda.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================== */}
      {/* MODAL */}
      {/* =================================================== */}

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent
          className="
            max-h-[90vh]
            w-[calc(100%-2rem)]
            overflow-y-auto
            sm:max-w-xl
          "
        >
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Nueva inscripción
            </DialogTitle>

            <DialogDescription className="text-slate-500">
              Selecciona el alumno y la carrera para inscribirlo en este
              simulacro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="alumno">Alumno</Label>

              <select
                id="alumno"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                "
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

              {alumnosDisponibles.length === 0 && (
                <p className="text-xs text-amber-600">
                  Todos los alumnos activos ya se encuentran inscritos.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrera">Carrera</Label>

              <select
                id="carrera"
                value={carreraId}
                onChange={(e) => setCarreraId(e.target.value)}
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                "
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

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-5">
            <Button
              variant="outline"
              onClick={() => setDialogAbierto(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              onClick={registrarInscripcion}
              disabled={guardando}
              className="
                rounded-xl
                bg-blue-600
                px-5
                text-white
                hover:bg-blue-700
              "
            >
              {guardando ? "Registrando..." : "Registrar inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
