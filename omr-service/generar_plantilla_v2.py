from pathlib import Path

import cv2
import numpy as np

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.config.omr_layout import (
    ALTERNATIVAS,
    CANONICAL_HEIGHT,
    CANONICAL_WIDTH,
    DNI_X,
    DNI_Y,
    MARCADORES_ESQUINA,
    RESPUESTAS_X_1,
    RESPUESTAS_X_2,
    RESPUESTAS_X_3,
    RESPUESTAS_X_4,
    RESPUESTAS_Y,
)


ESCALA = 2

ANCHO = CANONICAL_WIDTH * ESCALA
ALTO = CANONICAL_HEIGHT * ESCALA

RADIO_BURBUJA = 11 * ESCALA


SALIDA = Path("plantillas")
SALIDA.mkdir(exist_ok=True)


def p(valor: int) -> int:
    return valor * ESCALA


# ==========================================================
# HOJA
# ==========================================================

hoja = np.full(
    (ALTO, ANCHO, 3),
    255,
    dtype=np.uint8,
)


# ==========================================================
# MARCO EXTERIOR
# ==========================================================

cv2.rectangle(
    hoja,
    (p(35), p(35)),
    (p(1565), p(1095)),
    (0, 0, 0),
    p(2),
)


# ==========================================================
# MARCAS GRANDES EN LAS 4 ESQUINAS
# ==========================================================

for x, y in MARCADORES_ESQUINA:

    cv2.rectangle(
        hoja,
        (p(x - 13), p(y - 13)),
        (p(x + 13), p(y + 13)),
        (0, 0, 0),
        -1,
    )


# ==========================================================
# MARCAS LATERALES TIPO FICHA ÓPTICA
# ==========================================================

for indice in range(18):

    y = 260 + (42 * indice)

    cv2.rectangle(
        hoja,
        (p(60), p(y)),
        (p(78), p(y + 13)),
        (0, 0, 0),
        -1,
    )

    cv2.rectangle(
        hoja,
        (p(1522), p(y)),
        (p(1540), p(y + 13)),
        (0, 0, 0),
        -1,
    )


# ==========================================================
# DIVISIÓN PRINCIPAL
# ==========================================================

cv2.line(
    hoja,
    (p(540), p(110)),
    (p(540), p(1040)),
    (70, 70, 70),
    p(2),
)


# ==========================================================
# ENCABEZADO IZQUIERDO
# ==========================================================

cv2.putText(
    hoja,
    "SMARTEXAM",
    (p(130), p(115)),
    cv2.FONT_HERSHEY_SIMPLEX,
    1.15 * ESCALA,
    (0, 0, 0),
    p(2),
)

cv2.putText(
    hoja,
    "SIMULACRO DE ADMISION",
    (p(145), p(150)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.40 * ESCALA,
    (0, 0, 0),
    p(1),
)

cv2.putText(
    hoja,
    "HOJA DE IDENTIFICACION",
    (p(145), p(178)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.35 * ESCALA,
    (0, 0, 0),
    p(1),
)


# ==========================================================
# ENCABEZADO DERECHO
# ==========================================================

cv2.putText(
    hoja,
    "SMARTEXAM",
    (p(880), p(105)),
    cv2.FONT_HERSHEY_SIMPLEX,
    1.0 * ESCALA,
    (0, 0, 0),
    p(2),
)

cv2.putText(
    hoja,
    "HOJA DE RESPUESTAS",
    (p(905), p(145)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.52 * ESCALA,
    (0, 0, 0),
    p(1),
)

cv2.putText(
    hoja,
    "80 PREGUNTAS - A B C D E",
    (p(920), p(175)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.32 * ESCALA,
    (70, 70, 70),
    p(1),
)


# ==========================================================
# BLOQUE DNI
# ==========================================================

cv2.rectangle(
    hoja,
    (p(100), p(220)),
    (p(480), p(660)),
    (0, 0, 0),
    p(1),
)

cv2.putText(
    hoja,
    "CODIGO / DNI DEL POSTULANTE",
    (p(135), p(252)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.40 * ESCALA,
    (0, 0, 0),
    p(1),
)


# Número de columna

for columna, x in enumerate(DNI_X):

    cv2.putText(
        hoja,
        str(columna + 1),
        (p(x - 6), p(285)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.30 * ESCALA,
        (0, 0, 0),
        p(1),
    )


# Burbujas DNI

for x in DNI_X:

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
            (p(x - 27), p(y + 5)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.25 * ESCALA,
            (0, 0, 0),
            p(1),
        )


# ==========================================================
# DATOS DEL POSTULANTE
# ==========================================================

cv2.rectangle(
    hoja,
    (p(100), p(690)),
    (p(480), p(850)),
    (0, 0, 0),
    p(1),
)

cv2.putText(
    hoja,
    "DATOS DEL POSTULANTE",
    (p(150), p(722)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.38 * ESCALA,
    (0, 0, 0),
    p(1),
)


campos = [
    ("NOMBRES:", 765),
    ("APELLIDOS:", 810),
]

for texto, y in campos:

    cv2.putText(
        hoja,
        texto,
        (p(120), p(y)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.28 * ESCALA,
        (0, 0, 0),
        p(1),
    )

    cv2.line(
        hoja,
        (p(210), p(y + 3)),
        (p(455), p(y + 3)),
        (0, 0, 0),
        p(1),
    )


# ==========================================================
# INSTRUCCIONES
# ==========================================================

cv2.rectangle(
    hoja,
    (p(100), p(880)),
    (p(480), p(1020)),
    (0, 0, 0),
    p(1),
)

cv2.putText(
    hoja,
    "INSTRUCCIONES",
    (p(205), p(910)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.35 * ESCALA,
    (0, 0, 0),
    p(1),
)


instrucciones = [
    "Rellene completamente la burbuja.",
    "Marque solo una alternativa.",
    "Use lapicero negro para la prueba.",
    "No doble ni manche la ficha.",
]

y = 942

for texto in instrucciones:

    cv2.putText(
        hoja,
        texto,
        (p(120), p(y)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.24 * ESCALA,
        (0, 0, 0),
        p(1),
    )

    y += 23


# ==========================================================
# ÁREA RESPUESTAS
# ==========================================================

cv2.rectangle(
    hoja,
    (p(585), p(220)),
    (p(1490), p(1010)),
    (0, 0, 0),
    p(1),
)


COLUMNAS = [
    (
        RESPUESTAS_X_1,
        1,
    ),
    (
        RESPUESTAS_X_2,
        21,
    ),
    (
        RESPUESTAS_X_3,
        41,
    ),
    (
        RESPUESTAS_X_4,
        61,
    ),
]


def dibujar_columna(
    xs,
    inicio,
):

    # Cabecera A-E

    for letra, x in zip(
        ALTERNATIVAS,
        xs,
    ):

        cv2.putText(
            hoja,
            letra,
            (p(x - 7), p(262)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.32 * ESCALA,
            (0, 0, 0),
            p(1),
        )

    # 20 preguntas

    for indice, y in enumerate(
        RESPUESTAS_Y
    ):

        numero = inicio + indice

        cv2.putText(
            hoja,
            str(numero),
            (
                p(xs[0] - 48),
                p(y + 5),
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.26 * ESCALA,
            (0, 0, 0),
            p(1),
        )

        for x in xs:

            cv2.circle(
                hoja,
                (
                    p(x),
                    p(y),
                ),
                RADIO_BURBUJA,
                (0, 0, 0),
                p(1),
            )


for xs, inicio in COLUMNAS:

    dibujar_columna(
        xs,
        inicio,
    )


# Separadores verticales

separadores = [
    815,
    1040,
    1265,
]

for x in separadores:

    cv2.line(
        hoja,
        (p(x), p(235)),
        (p(x), p(990)),
        (140, 140, 140),
        p(1),
    )


# ==========================================================
# PIE
# ==========================================================

cv2.putText(
    hoja,
    "SMARTEXAM - FICHA OPTICA OMR V2",
    (p(650), p(1060)),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.30 * ESCALA,
    (0, 0, 0),
    p(1),
)


# ==========================================================
# PNG
# ==========================================================

ruta_png = (
    SALIDA /
    "plantilla_smartexam_omr_v2.png"
)

cv2.imwrite(
    str(ruta_png),
    hoja,
)


# ==========================================================
# PDF A4 HORIZONTAL
# ==========================================================

ruta_pdf = (
    SALIDA /
    "plantilla_smartexam_omr_v2.pdf"
)

pagina = landscape(A4)

pdf = canvas.Canvas(
    str(ruta_pdf),
    pagesize=pagina,
)

ancho_a4, alto_a4 = pagina


ancho_impresion = 277 * mm
alto_impresion = 196 * mm


x_pdf = (
    ancho_a4 - ancho_impresion
) / 2

y_pdf = (
    alto_a4 - alto_impresion
) / 2


pdf.drawImage(
    ImageReader(
        str(ruta_png)
    ),
    x_pdf,
    y_pdf,
    width=ancho_impresion,
    height=alto_impresion,
)

pdf.save()


print(
    "Ficha Optica SmartExam V2 "
    "generada correctamente."
)

print(
    f"PNG: {ruta_png}"
)

print(
    f"PDF: {ruta_pdf}"
)