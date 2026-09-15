-- CreateTable
CREATE TABLE "public"."Resultado" (
    "id" SERIAL NOT NULL,
    "puntajeTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "correctas" INTEGER NOT NULL DEFAULT 0,
    "incorrectas" INTEGER NOT NULL DEFAULT 0,
    "blancas" INTEGER NOT NULL DEFAULT 0,
    "dobles" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PROCESADO',
    "procesadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inscripcionId" INTEGER NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetalleResultado" (
    "id" SERIAL NOT NULL,
    "respuestaMarcada" TEXT,
    "tipo" TEXT NOT NULL,
    "puntajeObtenido" DOUBLE PRECISION NOT NULL,
    "resultadoId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,

    CONSTRAINT "DetalleResultado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_inscripcionId_key" ON "public"."Resultado"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleResultado_resultadoId_preguntaId_key" ON "public"."DetalleResultado"("resultadoId", "preguntaId");

-- AddForeignKey
ALTER TABLE "public"."Resultado" ADD CONSTRAINT "Resultado_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleResultado" ADD CONSTRAINT "DetalleResultado_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "public"."Resultado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetalleResultado" ADD CONSTRAINT "DetalleResultado_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "public"."Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
