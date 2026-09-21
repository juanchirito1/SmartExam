-- CreateTable
CREATE TABLE "public"."UsuarioPermisoTemporal" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "asignadoPorId" INTEGER,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPermisoTemporal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsuarioPermisoTemporal_usuarioId_estado_fechaFin_idx" ON "public"."UsuarioPermisoTemporal"("usuarioId", "estado", "fechaFin");

-- CreateIndex
CREATE INDEX "UsuarioPermisoTemporal_permisoId_idx" ON "public"."UsuarioPermisoTemporal"("permisoId");

-- AddForeignKey
ALTER TABLE "public"."UsuarioPermisoTemporal" ADD CONSTRAINT "UsuarioPermisoTemporal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioPermisoTemporal" ADD CONSTRAINT "UsuarioPermisoTemporal_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "public"."Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioPermisoTemporal" ADD CONSTRAINT "UsuarioPermisoTemporal_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
