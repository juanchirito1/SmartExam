-- CreateTable
CREATE TABLE "public"."Grupo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Carrera" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupoId" INTEGER NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Area" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReglaPuntaje" (
    "id" SERIAL NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "puntajeCorrecta" DOUBLE PRECISION NOT NULL,
    "puntajeIncorrecta" DOUBLE PRECISION NOT NULL DEFAULT -0.1,
    "puntajeBlanco" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ReglaPuntaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pregunta" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_codigo_key" ON "public"."Grupo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "public"."Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "public"."Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ReglaPuntaje_grupoId_areaId_key" ON "public"."ReglaPuntaje"("grupoId", "areaId");

-- AddForeignKey
ALTER TABLE "public"."Carrera" ADD CONSTRAINT "Carrera_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "public"."Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReglaPuntaje" ADD CONSTRAINT "ReglaPuntaje_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "public"."Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReglaPuntaje" ADD CONSTRAINT "ReglaPuntaje_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pregunta" ADD CONSTRAINT "Pregunta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
