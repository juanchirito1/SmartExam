-- CreateTable
CREATE TABLE "public"."Ciclo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Simulacro" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "totalPreguntas" INTEGER NOT NULL DEFAULT 80,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cicloId" INTEGER NOT NULL,

    CONSTRAINT "Simulacro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ciclo_nombre_key" ON "public"."Ciclo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Simulacro_cicloId_numero_key" ON "public"."Simulacro"("cicloId", "numero");

-- AddForeignKey
ALTER TABLE "public"."Simulacro" ADD CONSTRAINT "Simulacro_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
