from pathlib import Path

import cv2
import numpy as np

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from app.config.omr_layout import (
    ALTERNATIVAS,
    CANONICAL_HEIGHT,
    CANONICAL_WIDTH,
    DNI_X,
    DNI_Y,
    MARCADORES_ESQUINA,
    REGISTRO_CENTRAL_X_1,
    REGISTRO_CENTRAL_X_2,
    RESPUESTAS_X_1,
    RESPUESTAS_X_2,
    RESPUESTAS_X_3,
    RESPUESTAS_X_4,
    RESPUESTAS_Y,
)


# ============================================================
# CONFIGURACION
# ============================================================

ESCALA = 2

ANCHO = CANONICAL_WIDTH * ESCALA
ALTO = CANONICAL_HEIGHT * ESCALA

RADIO_BURBUJA = 10 * ESCALA

NEGRO = (0, 0, 0)

# OpenCV usa BGR
CELESTE = (220, 200, 80)
CELESTE_CLARO = (250, 245, 220)
GRIS = (120, 120, 120)

SALIDA = Path("plantillas")
SALIDA.mkdir(exist_ok=True)


def p(valor: int) -> int:
    return valor * ESCALA


def texto(
    imagen,
    contenido,
    x,
    y,
    escala=0.35,
    grosor=1,
    color=NEGRO,
):
    cv2.putText(
        imagen,
        contenido,
        (p(x), p(y)),
        cv2.FONT_HERSHEY_SIMPLEX,
        escala * ESCALA,
        color,
        p(grosor),
        cv2.LINE_AA,
    )


# ============================================================
# HOJA
# ============================================================

hoja = np.full(
    (ALTO, ANCHO, 3),
    255,
    dtype=np.uint8,
)


# ============================================================
# MARCO EXTERIOR
# ============================================================

cv2.rectangle(
    hoja,
    (p(25), p(25)),
    (p(1775), p(1225)),
    NEGRO,
    p(2),
)


# ============================================================
# MARCAS DE LAS CUATRO ESQUINAS
# ============================================================

for x, y in MARCADORES_ESQUINA:

    cv2.rectangle(
        hoja,
        (p(x - 12), p(y - 12)),
        (p(x + 12), p(y + 12)),
        NEGRO,
        -1,
    )


# ============================================================
# MARCAS LATERALES DE SINCRONIZACION
# ============================================================

for indice in range(20):

    y = 300 + (39 * indice)

    # Izquierda
    cv2.rectangle(
        hoja,
        (p(42), p(y)),
        (p(60), p(y + 12)),
        NEGRO,
        -1,
    )

    # Derecha
    cv2.rectangle(
        hoja,
        (p(1740), p(y)),
        (p(1758), p(y + 12)),
        NEGRO,
        -1,
    )


# ============================================================
# LINEA VERTICAL DE SEPARACION
# ============================================================

cv2.line(
    hoja,
    (p(555), p(40)),
    (p(555), p(1205)),
    CELESTE,
    p(2),
)


# ============================================================
# ENCABEZADO IZQUIERDO
# ============================================================

texto(
    hoja,
    "SIMULACRO DE ADMISION",
    160,
    75,
    0.40,
    2,
)

texto(
    hoja,
    "SMARTEXAM",
    160,
    110,
    0.65,
    2,
)

texto(
    hoja,
    "HOJA DE IDENTIFICACION",
    165,
    145,
    0.34,
    1,
)


# ============================================================
# AULA
# ============================================================

texto(
    hoja,
    "AULA",
    155,
    195,
    0.35,
    2,
)

for i in range(4):

    x1 = 225 + (43 * i)

    cv2.rectangle(
        hoja,
        (p(x1), p(170)),
        (p(x1 + 40), p(205)),
        CELESTE,
        p(1),
    )


# ============================================================
# EJEMPLOS DE MARCA
# ============================================================

cv2.rectangle(
    hoja,
    (p(145), p(225)),
    (p(455), p(295)),
    CELESTE,
    p(1),
)

texto(
    hoja,
    "EJEMPLOS DE MARCA",
    235,
    246,
    0.28,
    2,
)

texto(
    hoja,
    "CORRECTA",
    165,
    270,
    0.22,
    1,
)

cv2.circle(
    hoja,
    (p(275), p(266)),
    p(8),
    NEGRO,
    -1,
)

texto(
    hoja,
    "INCORRECTAS",
    315,
    270,
    0.22,
    1,
)

for i in range(3):

    x = 405 + (18 * i)

    cv2.circle(
        hoja,
        (p(x), p(266)),
        p(7),
        NEGRO,
        p(1),
    )


# ============================================================
# BLOQUE DNI
# ============================================================

cv2.rectangle(
    hoja,
    (p(105), p(310)),
    (p(485), p(695)),
    CELESTE,
    p(2),
)

texto(
    hoja,
    "CODIGO / DNI DEL POSTULANTE",
    175,
    332,
    0.29,
    2,
)


# Encabezado de columnas

for columna, x in enumerate(DNI_X):

    texto(
        hoja,
        str(columna + 1),
        x - 5,
        340,
        0.23,
        1,
    )


# Burbujas del DNI

for x in DNI_X:

    for digito, y in enumerate(DNI_Y):

        cv2.circle(
            hoja,
            (p(x), p(y)),
            RADIO_BURBUJA,
            CELESTE,
            p(1),
        )

        texto(
            hoja,
            str(digito),
            x - 4,
            y + 4,
            0.20,
            1,
            GRIS,
        )


# ============================================================
# DATOS PERSONALES
# ============================================================

campos = [
    ("APELLIDO PATERNO", 735),
    ("APELLIDO MATERNO", 790),
    ("NOMBRES", 845),
]

for etiqueta, y in campos:

    cv2.rectangle(
        hoja,
        (p(105), p(y - 30)),
        (p(485), p(y + 15)),
        CELESTE,
        p(1),
    )

    texto(
        hoja,
        etiqueta,
        240,
        y - 4,
        0.22,
        1,
    )


# ============================================================
# FIRMA
# ============================================================

cv2.rectangle(
    hoja,
    (p(105), p(885)),
    (p(485), p(1010)),
    CELESTE,
    p(1),
)

texto(
    hoja,
    "FIRMA DEL POSTULANTE",
    205,
    990,
    0.22,
    1,
)


# ============================================================
# HUELLA
# ============================================================

cv2.rectangle(
    hoja,
    (p(225), p(1030)),
    (p(365), p(1160)),
    GRIS,
    p(1),
)

texto(
    hoja,
    "HUELLA INDICE",
    245,
    1180,
    0.20,
    1,
)


# ============================================================
# DOS FRANJAS CENTRALES DE REGISTRO
# ============================================================

def dibujar_franja_registro(x):

    cv2.rectangle(
        hoja,
        (p(x - 18), p(315)),
        (p(x + 18), p(1060)),
        CELESTE,
        p(1),
    )

    for i in range(11):

        y = 360 + (61 * i)

        cv2.rectangle(
            hoja,
            (p(x - 8), p(y)),
            (p(x + 8), p(y + 18)),
            NEGRO,
            -1,
        )


dibujar_franja_registro(
    REGISTRO_CENTRAL_X_1
)

dibujar_franja_registro(
    REGISTRO_CENTRAL_X_2
)


# ============================================================
# ENCABEZADO CENTRAL / RESPUESTAS
# ============================================================

texto(
    hoja,
    "SMARTEXAM",
    955,
    85,
    0.70,
    2,
)

texto(
    hoja,
    "SIMULACRO DE ADMISION",
    925,
    125,
    0.34,
    1,
)

texto(
    hoja,
    "HOJA DE RESPUESTAS",
    955,
    160,
    0.40,
    2,
)


# ============================================================
# INSTRUCCIONES ARRIBA A LA DERECHA
# ============================================================

cv2.rectangle(
    hoja,
    (p(1430), p(55)),
    (p(1715), p(250)),
    CELESTE,
    p(2),
)

texto(
    hoja,
    "INSTRUCCIONES",
    1500,
    80,
    0.30,
    2,
)

instrucciones = [
    "Use lapicero negro.",
    "Rellene completamente",
    "una sola alternativa.",
    "No borre ni manche.",
    "No doble la ficha.",
]

y = 108

for linea in instrucciones:

    texto(
        hoja,
        linea,
        1450,
        y,
        0.22,
        1,
    )

    y += 25


# Ejemplo correcto

texto(
    hoja,
    "MARCA CORRECTA",
    1450,
    220,
    0.20,
    1,
)

cv2.circle(
    hoja,
    (p(1600), p(215)),
    p(8),
    NEGRO,
    -1,
)


# ============================================================
# PANEL DE RESPUESTAS
# ============================================================

cv2.rectangle(
    hoja,
    (p(735), p(275)),
    (p(1685), p(1125)),
    CELESTE,
    p(2),
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


def dibujar_columna_respuestas(
    xs,
    inicio,
):

    # Encabezado A-E

    for letra, x in zip(
        ALTERNATIVAS,
        xs,
    ):

        texto(
            hoja,
            letra,
            x - 5,
            320,
            0.23,
            2,
        )

    # Preguntas

    for indice, y in enumerate(
        RESPUESTAS_Y
    ):

        numero = inicio + indice

        texto(
            hoja,
            str(numero),
            xs[0] - 48,
            y + 5,
            0.20,
            1,
        )

        for x in xs:

            cv2.circle(
                hoja,
                (p(x), p(y)),
                RADIO_BURBUJA,
                CELESTE,
                p(1),
            )


for xs, inicio in COLUMNAS:

    dibujar_columna_respuestas(
        xs,
        inicio,
    )


# ============================================================
# SEPARADORES ENTRE LOS 4 BLOQUES
# ============================================================

for x in [
    960,
    1190,
    1420,
]:

    cv2.line(
        hoja,
        (p(x), p(295)),
        (p(x), p(1110)),
        CELESTE,
        p(1),
    )


# ============================================================
# PIE
# ============================================================

texto(
    hoja,
    "SMARTEXAM - FICHA OPTICA OMR V3",
    970,
    1175,
    0.23,
    1,
    GRIS,
)


# ============================================================
# EXPORTAR PNG
# ============================================================

ruta_png = (
    SALIDA
    / "plantilla_smartexam_omr_v3.png"
)

cv2.imwrite(
    str(ruta_png),
    hoja,
)


# ============================================================
# EXPORTAR PDF A4 HORIZONTAL
# ============================================================

ruta_pdf = (
    SALIDA
    / "plantilla_smartexam_omr_v3.pdf"
)

pagina = landscape(A4)

pdf = canvas.Canvas(
    str(ruta_pdf),
    pagesize=pagina,
)

ancho_a4, alto_a4 = pagina

ancho_impresion = 282 * mm
alto_impresion = 196 * mm

x_pdf = (
    ancho_a4
    - ancho_impresion
) / 2

y_pdf = (
    alto_a4
    - alto_impresion
) / 2

pdf.drawImage(
    ImageReader(
        str(ruta_png)
    ),
    x_pdf,
    y_pdf,
    width=ancho_impresion,
    height=alto_impresion,
    preserveAspectRatio=True,
)

pdf.save()


print()
print(
    "Ficha Optica SmartExam V3 "
    "generada correctamente."
)

print(
    f"PNG: {ruta_png}"
)

print(
    f"PDF: {ruta_pdf}"
)