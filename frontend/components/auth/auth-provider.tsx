"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";

interface UsuarioAuth {
  id: number;
  nombre: string;
  correo: string;

  rol: {
    id: number;
    nombre: string;
  };
}

interface AuthResponse extends UsuarioAuth {
  permisos: string[];
}

interface AuthContextValue {
  usuario: UsuarioAuth | null;
  permisos: string[];
  cargando: boolean;

  refrescarAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/*
  Cache en memoria.

  Evita que React/Next dispare múltiples veces
  GET /auth/me durante la misma sesión.
*/

let cacheToken: string | null = null;
let cacheAuth: AuthResponse | null = null;

let authPromise: Promise<AuthResponse> | null = null;

async function obtenerAuth(
  token: string,
  forzar = false,
): Promise<AuthResponse> {
  /*
    Si cambia el token, invalidamos
    automáticamente la sesión almacenada.
  */

  if (cacheToken !== token || forzar) {
    cacheToken = token;
    cacheAuth = null;
    authPromise = null;
  }

  /*
    Ya tenemos los datos.
  */

  if (cacheAuth) {
    return cacheAuth;
  }

  /*
    Si ya existe una petición /auth/me
    en curso, todos esperan esa misma petición.
  */

  if (authPromise) {
    return authPromise;
  }

  authPromise = api
    .get<AuthResponse>("/auth/me")
    .then((response) => {
      cacheAuth = response.data;

      return response.data;
    })
    .finally(() => {
      authPromise = null;
    });

  return authPromise;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);

  const [permisos, setPermisos] = useState<string[]>([]);

  const [cargando, setCargando] = useState(true);

  async function cargarAuth(forzar = false) {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      setPermisos([]);
      setCargando(false);

      return;
    }

    try {
      const data = await obtenerAuth(token, forzar);

      setUsuario({
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol,
      });

      setPermisos(data.permisos ?? []);
    } catch (error: any) {
      console.error("Error cargando sesión:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
      }

      setUsuario(null);
      setPermisos([]);
    } finally {
      setCargando(false);
    }
  }

  async function refrescarAuth() {
    setCargando(true);

    await cargarAuth(true);
  }

  useEffect(() => {
    cargarAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        permisos,
        cargando,
        refrescarAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
