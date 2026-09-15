# ============================================================
# SMARTEXAM - OMR V3
# GEOMETRIA CANONICA
# ============================================================

CANONICAL_WIDTH = 1800
CANONICAL_HEIGHT = 1250


# ============================================================
# ALTERNATIVAS
# ============================================================

ALTERNATIVAS = [
    "A",
    "B",
    "C",
    "D",
    "E",
]


# ============================================================
# DNI
#
# 8 columnas
# Cada columna representa los dígitos 0 - 9
# ============================================================

DNI_X = [
    155,
    195,
    235,
    275,
    315,
    355,
    395,
    435,
]

DNI_Y = [
    350 + (32 * i)
    for i in range(10)
]


# ============================================================
# RESPUESTAS
#
# 4 bloques × 20 preguntas
# ============================================================

# Preguntas 1 - 20
RESPUESTAS_X_1 = [
    790,
    820,
    850,
    880,
    910,
]

# Preguntas 21 - 40
RESPUESTAS_X_2 = [
    1020,
    1050,
    1080,
    1110,
    1140,
]

# Preguntas 41 - 60
RESPUESTAS_X_3 = [
    1250,
    1280,
    1310,
    1340,
    1370,
]

# Preguntas 61 - 80
RESPUESTAS_X_4 = [
    1480,
    1510,
    1540,
    1570,
    1600,
]


RESPUESTAS_Y = [
    355 + (37 * i)
    for i in range(20)
]


# ============================================================
# MARCADORES GRANDES DE ESQUINA
#
# Coordenadas originales de la plantilla.
# ============================================================

MARCADOR_SUP_IZQ = (
    45,
    45,
)

MARCADOR_SUP_DER = (
    1755,
    45,
)

MARCADOR_INF_DER = (
    1755,
    1205,
)

MARCADOR_INF_IZQ = (
    45,
    1205,
)


# ============================================================
# MARCAS LATERALES
#
# Se usan principalmente para determinar orientación.
# ============================================================

MARCADORES_LATERALES_X = [
    51,
    1749,
]

MARCADORES_LATERALES_Y = [
    306 + (39 * i)
    for i in range(20)
]


# ============================================================
# FRANJAS CENTRALES
#
# También ayudan a detectar la orientación correcta.
# ============================================================

REGISTRO_CENTRAL_X = [
    590,
    665,
]

REGISTRO_CENTRAL_Y = [
    369 + (61 * i)
    for i in range(11)
]


# ============================================================
# DETECCION DE MARCADORES POR REGION
# ============================================================

MARGEN_ROI_MARCADOR_X = 110
MARGEN_ROI_MARCADOR_Y = 110

TAMANO_VENTANA_MARCADOR = 19

# Intensidad media máxima aceptada.
# 0 = negro absoluto
# 255 = blanco absoluto
UMBRAL_OSCURIDAD_MARCADOR = 140


# ============================================================
# LECTURA DE BURBUJAS
# ============================================================

RADIO_LECTURA = 7

# Marca física con lapicero/fotografía.
UMBRAL_MARCA = 0.35