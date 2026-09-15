/*
  Warnings:

  - A unique constraint covering the columns `[simulacroId,numero]` on the table `Pregunta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `respuestaCorrecta` to the `Pregunta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `simulacroId` to the `Pregunta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Pregunta" ADD COLUMN     "respuestaCorrecta" TEXT NOT NULL,
ADD COLUMN     "simulacroId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Pregunta_simulacroId_numero_key" ON "public"."Pregunta"("simulacroId", "numero");

-- AddForeignKey
ALTER TABLE "public"."Pregunta" ADD CONSTRAINT "Pregunta_simulacroId_fkey" FOREIGN KEY ("simulacroId") REFERENCES "public"."Simulacro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
