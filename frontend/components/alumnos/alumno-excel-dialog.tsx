"use client";

import { ChangeEvent, useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RegistroExcel {
  fila: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;

  valido: boolean;

  estado: "VALIDO" | "DUPLICADO" | "ERROR";

  observacion: string | null;
}

interface PreviewExcel {
  archivo: string;
  total: number;
  validos: number;
  duplicados: number;
  errores: number;
  registros: RegistroExcel[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onImportado: () => void;
}

export default function AlumnoExcelDialog({
  open,
  onOpenChange,
  onImportado,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<PreviewExcel | null>(null);

  const [archivo, setArchivo] = useState<File | null>(null);

  const [analizando, setAnalizando] = useState(false);

  const [importando, setImportando] = useState(false);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  function limpiar() {
    setArchivo(null);
    setPreview(null);
    setError("");
    setMensaje("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function cerrar(value: boolean) {
    if (!value && !analizando && !importando) {
      limpiar();
    }

    onOpenChange(value);
  }

  async function seleccionarArchivo(event: ChangeEvent<HTMLInputElement>) {
    const seleccionado = event.target.files?.[0];

    if (!seleccionado) {
      return;
    }

    setArchivo(seleccionado);

    setPreview(null);
    setError("");
    setMensaje("");
    setAnalizando(true);

    try {
      const formData = new FormData();

      formData.append("archivo", seleccionado);

      const response = await api.post("/alumnos-excel/preview", formData);

      setPreview(response.data);
    } catch (error: any) {
      setArchivo(null);

      setError(
        error?.response?.data?.message ||
          "No se pudo analizar el archivo Excel.",
      );
    } finally {
      setAnalizando(false);
    }
  }

  async function importar() {
    if (!preview || preview.validos === 0) {
      return;
    }

    const alumnosValidos = preview.registros
      .filter((registro) => registro.valido)
      .map((registro) => ({
        fila: registro.fila,

        dni: registro.dni,

        nombres: registro.nombres,

        apellidos: registro.apellidos,

        telefono: registro.telefono,

        correo: registro.correo,
      }));

    setImportando(true);
    setError("");
    setMensaje("");

    try {
      const response = await api.post("/alumnos-excel/importar", {
        alumnos: alumnosValidos,
      });

      setMensaje(
        `${response.data.importados} alumno${
          response.data.importados !== 1 ? "s" : ""
        } importado${response.data.importados !== 1 ? "s" : ""} correctamente.`,
      );

      await onImportado();

      setTimeout(() => {
        cerrar(false);
      }, 900);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "No se pudieron importar los alumnos.",
      );
    } finally {
      setImportando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent
        className="
          max-h-[90vh]
          w-[calc(100%-2rem)]
          overflow-y-auto
          sm:max-w-4xl
        "
      >
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Importar alumnos desde Excel
          </DialogTitle>

          <DialogDescription className="text-slate-500">
            Selecciona un archivo XLSX. SmartExam validará los registros antes
            de guardarlos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* CARGA */}

          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              p-6
              text-center
            "
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xlsm"
              onChange={seleccionarArchivo}
              className="hidden"
              id="archivo-excel-alumnos"
            />

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <Upload className="h-5 w-5" />
            </div>

            <p className="mt-3 font-medium text-slate-700">
              {archivo ? archivo.name : "Selecciona el archivo de alumnos"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Columnas requeridas: DNI, Nombres, Apellidos, Telefono y Correo.
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={analizando || importando}
              onClick={() => inputRef.current?.click()}
              className="mt-4 gap-2 rounded-xl"
            >
              {analizando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}

              {analizando
                ? "Analizando..."
                : preview
                  ? "Cambiar archivo"
                  : "Seleccionar Excel"}
            </Button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* ÉXITO */}

          {mensaje && (
            <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{mensaje}</span>
            </div>
          )}

          {preview && (
            <>
              {/* RESUMEN */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Resumen label="Registros" valor={preview.total} />

                <Resumen
                  label="Válidos"
                  valor={preview.validos}
                  tipo="valido"
                />

                <Resumen
                  label="Duplicados"
                  valor={preview.duplicados}
                  tipo="duplicado"
                />

                <Resumen label="Errores" valor={preview.errores} tipo="error" />
              </div>

              {/* MÓVIL */}

              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 md:hidden">
                {preview.registros.map((registro) => (
                  <div key={registro.fila} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {registro.nombres} {registro.apellidos}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          DNI {registro.dni || "—"}
                        </p>
                      </div>

                      <EstadoBadge estado={registro.estado} />
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      <p>Fila {registro.fila}</p>

                      {registro.observacion && (
                        <p className="mt-1 text-slate-700">
                          {registro.observacion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}

              <div className="hidden max-h-[360px] overflow-auto rounded-2xl border border-slate-200 md:block">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        Fila
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        DNI
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        Alumno
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        Estado
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        Observación
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.registros.map((registro) => (
                      <tr
                        key={registro.fila}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {registro.fila}
                        </td>

                        <td className="px-4 py-3 font-mono text-sm text-slate-700">
                          {registro.dni || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-800">
                            {registro.nombres} {registro.apellidos}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <EstadoBadge estado={registro.estado} />
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500">
                          {registro.observacion ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="outline"
            disabled={importando}
            onClick={() => cerrar(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={importar}
            disabled={!preview || preview.validos === 0 || importando}
            className="gap-2 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
          >
            {importando && <Loader2 className="h-4 w-4 animate-spin" />}

            {importando
              ? "Importando..."
              : `Importar ${preview?.validos ?? 0} alumno${
                  preview?.validos === 1 ? "" : "s"
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Resumen({
  label,
  valor,
  tipo = "normal",
}: {
  label: string;
  valor: number;
  tipo?: "normal" | "valido" | "duplicado" | "error";
}) {
  const estilos = {
    normal: "bg-slate-50 text-slate-900",

    valido: "bg-emerald-50 text-emerald-700",

    duplicado: "bg-amber-50 text-amber-700",

    error: "bg-red-50 text-red-700",
  };

  return (
    <div
      className={`
        rounded-xl
        p-4
        ${estilos[tipo]}
      `}
    >
      <p className="text-xs opacity-70">{label}</p>

      <p className="mt-1 text-2xl font-bold">{valor}</p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: "VALIDO" | "DUPLICADO" | "ERROR" }) {
  const estilos = {
    VALIDO: "bg-emerald-50 text-emerald-700",

    DUPLICADO: "bg-amber-50 text-amber-700",

    ERROR: "bg-red-50 text-red-700",
  };

  const textos = {
    VALIDO: "Válido",

    DUPLICADO: "Duplicado",

    ERROR: "Error",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ${estilos[estado]}
      `}
    >
      {textos[estado]}
    </span>
  );
}
