import cv2
import numpy as np

ANCHO = 1000
ALTO = 1400

# =========================================================
# COORDENADAS OFICIALES
# =========================================================

DNI_X = [
    100, 140, 180, 220,
    260, 300, 340, 380,
]

DNI_Y = [
    250 + (28 * i)
    for i in range(10)
]

RESPUESTAS_X_IZQUIERDA = [
    520, 555, 590, 625, 660
]

RESPUESTAS_X_DERECHA = [
    760, 795, 830, 865, 900
]

RESPUESTAS_Y = [
    250 + (27 * i)
    for i in range(40)
]

ALTERNATIVAS = ["A", "B", "C", "D", "E"]

RADIO = 9

# =========================================================
# HOJA
# =========================================================

hoja = np.full(
    (ALTO, ANCHO, 3),
    255,
    dtype=np.uint8,
)

# Marco
cv2.rectangle(
    hoja,
    (10, 10),
    (ANCHO - 10, ALTO - 10),
    (0, 0, 0),
    3,
)

cv2.putText(
    hoja,
    "SMARTEXAM - HOJA DE RESPUESTAS",
    (250, 65),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.9,
    (0, 0, 0),
    2,
)

# =========================================================
# DNI
# =========================================================

cv2.putText(
    hoja,
    "DNI",
    (80, 185),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.8,
    (0, 0, 0),
    2,
)

dni = "72845163"

for columna, x in enumerate(DNI_X):

    cv2.putText(
        hoja,
        str(columna + 1),
        (x - 5, 220),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.4,
        (0, 0, 0),
        1,
    )

    for digito, y in enumerate(DNI_Y):

        cv2.circle(
            hoja,
            (x, y),
            RADIO,
            (0, 0, 0),
            1,
        )

        cv2.putText(
            hoja,
            str(digito),
            (x - 25, y + 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.3,
            (0, 0, 0),
            1,
        )

        if int(dni[columna]) == digito:

            cv2.circle(
                hoja,
                (x, y),
                RADIO - 2,
                (0, 0, 0),
                -1,
            )

# =========================================================
# RESPUESTAS
# =========================================================

def dibujar_columna(xs, inicio):

    for indice, y in enumerate(RESPUESTAS_Y):

        numero = inicio + indice

        cv2.putText(
            hoja,
            str(numero),
            (xs[0] - 45, y + 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.35,
            (0, 0, 0),
            1,
        )

        # Clave de prueba:
        # 1=A, 2=B, 3=C, 4=D, 5=E...
        correcta = (numero - 1) % 5

        for opcion, x in enumerate(xs):

            cv2.circle(
                hoja,
                (x, y),
                RADIO,
                (0, 0, 0),
                1,
            )

            if opcion == correcta:

                cv2.circle(
                    hoja,
                    (x, y),
                    RADIO - 2,
                    (0, 0, 0),
                    -1,
                )


dibujar_columna(
    RESPUESTAS_X_IZQUIERDA,
    1,
)

dibujar_columna(
    RESPUESTAS_X_DERECHA,
    41,
)

# =========================================================
# SIMULAMOS UNA FOTO
# =========================================================

foto = np.full(
    (1600, 1200, 3),
    120,
    dtype=np.uint8,
)

foto[
    100:1500,
    100:1100,
] = hoja

cv2.imwrite(
    "ficha_prueba_72845163.png",
    foto,
)

print(
    "Ficha creada: "
    "ficha_prueba_72845163.png"
)