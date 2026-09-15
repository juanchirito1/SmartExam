from pathlib import Path

import cv2
import numpy as np

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.config.omr_layout import (
    ALTERNATIVAS,
    CANONICAL_HEIGHT,
    CANONICAL_WIDTH,
    DNI_X,
    DNI_Y,
    RESPUESTAS_X_IZQUIERDA,
    RESPUESTAS_X_DERECHA,
    RESPUESTAS_Y,
)


# =========================================================
# CONFIGURACIÓN
# =========================================================

ESCALA = 3

ANCHO = CANONICAL_WIDTH * ESCALA
ALTO = CANONICAL_HEIGHT * ESCALA

RADIO_BURBUJA = 9 * ESCALA

SALIDA = Path("plantillas")
SALIDA.mkdir(exist_ok=True)


def p(valor: int) -> int:
    return valor * ESCALA


# =========================================================
# CANVAS BASE
# =========================================================

hoja = np.full(
    (ALTO, ANCHO, 3),
    255,
    dtype=np.uint8,
)


# =========================================================
# MARCO DE REFERENCIA
# =========================================================

cv2.rectangle(
    hoja,
    (p(10), p(10)),
    (p(990), p(1390)),
    (0, 0, 0),
    p(3),
)


# =========================================================
# MARCAS DE ESQUINA
# =========================================================

marcas = [
    (35, 35),
    (965, 35),
    (35, 1365),
    (965, 1365),
]

for x, y in marcas:
    cv2.rectangle(
        hoja,
        (p(x - 10), p(y - 10)),
        (p(x + 10), p(y + 10)),
        (0, 0, 0),
        -1,
    )


# =========================================================
# ENCABEZADO
# =========================================================

cv2.putText(
    hoja,
    "SMARTEXAM",
    (p(80), p(75)),
    cv2.FONT_HERSHEY_SIMPLEX,
    1.25 * ESCALA,
    (0, 0, 0),
    p(2),
)

cv2.putText(
    hoja,
    "HOJA OFICIAL DE RESPUESTAS",
    (p(510), p(65)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7 * ESCALA,
    (0, 0, 0),
    p(2),
)

cv2.putText(
    hoja,
    "FORMATO OMR V1 - 80 PREGUNTAS",
    (p(540), p(95)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.38 * ESCALA,
    (0, 0, 0),
    p(1),
)

cv2.line(
    hoja,
    (p(60), p(120)),
    (p(940), p(120)),
    (0, 0, 0),
    p(1),
)


# =========================================================
# DNI
# =========================================================

cv2.putText(
    hoja,
    "1. DNI DEL POSTULANTE",
    (p(70), p(175)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.58 * ESCALA,
    (0, 0, 0),
    p(2),
)

cv2.putText(
    hoja,
    "Marque un solo numero por columna",
    (p(70), p(205)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.34 * ESCALA,
    (60, 60, 60),
    p(1),
)


for columna, x in enumerate(DNI_X):

    cv2.putText(
        hoja,
        str(columna + 1),
        (p(x - 5), p(230)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.38 * ESCALA,
        (0, 0, 0),
        p(1),
    )

    for digito, y in enumerate(DNI_Y):

        cv2.circle(
            hoja,
            (p(x), p(y)),
            RADIO_BURBUJA,
            (0, 0, 0),
            p(1),
        )

        cv2.putText(
            hoja,
            str(digito),
            (p(x - 27), p(y + 4)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.28 * ESCALA,
            (0, 0, 0),
            p(1),
        )


# =========================================================
# DATOS MANUALES
# =========================================================

cv2.putText(
    hoja,
    "2. DATOS DEL POSTULANTE",
    (p(70), p(610)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.50 * ESCALA,
    (0, 0, 0),
    p(2),
)

campos = [
    ("Nombres:", 655),
    ("Apellidos:", 700),
]

for etiqueta, y in campos:

    cv2.putText(
        hoja,
        etiqueta,
        (p(70), p(y)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.35 * ESCALA,
        (0, 0, 0),
        p(1),
    )

    cv2.line(
        hoja,
        (p(145), p(y + 3)),
        (p(390), p(y + 3)),
        (0, 0, 0),
        p(1),
    )


# =========================================================
# INSTRUCCIONES
# =========================================================

cv2.putText(
    hoja,
    "INSTRUCCIONES",
    (p(70), p(790)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.48 * ESCALA,
    (0, 0, 0),
    p(2),
)

instrucciones = [
    "1. Use lapicero negro para la prueba inicial.",
    "2. Rellene completamente la burbuja.",
    "3. Marque solo una alternativa por pregunta.",
    "4. No escriba sobre el marco ni las esquinas.",
    "5. Mantenga la hoja limpia y sin dobleces.",
]

y = 825

for texto in instrucciones:

    cv2.putText(
        hoja,
        texto,
        (p(70), p(y)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.28 * ESCALA,
        (0, 0, 0),
        p(1),
    )

    y += 32


# =========================================================
# RESPUESTAS
# =========================================================

cv2.putText(
    hoja,
    "3. RESPUESTAS",
    (p(480), p(175)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.58 * ESCALA,
    (0, 0, 0),
    p(2),
)


def dibujar_encabezado(xs):

    for letra, x in zip(
        ALTERNATIVAS,
        xs,
    ):
        cv2.putText(
            hoja,
            letra,
            (p(x - 6), p(225)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.35 * ESCALA,
            (0, 0, 0),
            p(1),
        )


dibujar_encabezado(
    RESPUESTAS_X_IZQUIERDA
)

dibujar_encabezado(
    RESPUESTAS_X_DERECHA
)


def dibujar_respuestas(
    xs,
    inicio,
):

    for indice, y in enumerate(
        RESPUESTAS_Y
    ):

        numero = inicio + indice

        cv2.putText(
            hoja,
            str(numero),
            (p(xs[0] - 45), p(y + 5)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.30 * ESCALA,
            (0, 0, 0),
            p(1),
        )

        for x in xs:

            cv2.circle(
                hoja,
                (p(x), p(y)),
                RADIO_BURBUJA,
                (0, 0, 0),
                p(1),
            )


dibujar_respuestas(
    RESPUESTAS_X_IZQUIERDA,
    1,
)

dibujar_respuestas(
    RESPUESTAS_X_DERECHA,
    41,
)


# =========================================================
# PIE
# =========================================================

cv2.putText(
    hoja,
    "SmartExam - Documento de lectura optica",
    (p(350), p(1360)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.32 * ESCALA,
    (0, 0, 0),
    p(1),
)


# =========================================================
# PNG
# =========================================================

ruta_png = (
    SALIDA
    / "plantilla_smartexam_omr_v1.png"
)

cv2.imwrite(
    str(ruta_png),
    hoja,
)


# =========================================================
# PDF A4
# =========================================================

ruta_pdf = (
    SALIDA
    / "plantilla_smartexam_omr_v1.pdf"
)

pdf = canvas.Canvas(
    str(ruta_pdf),
    pagesize=A4,
)

ancho_a4, alto_a4 = A4

# Área impresa 200 × 280 mm.
# Mantiene prácticamente la misma proporción 1000 × 1400.
ancho_impresion = 200 * mm
alto_impresion = 280 * mm

x_pdf = (
    ancho_a4 - ancho_impresion
) / 2

y_pdf = (
    alto_a4 - alto_impresion
) / 2

pdf.drawImage(
    ImageReader(str(ruta_png)),
    x_pdf,
    y_pdf,
    width=ancho_impresion,
    height=alto_impresion,
    preserveAspectRatio=True,
)

pdf.save()


print("Plantilla SmartExam generada correctamente.")
print(f"PNG: {ruta_png}")
print(f"PDF: {ruta_pdf}")