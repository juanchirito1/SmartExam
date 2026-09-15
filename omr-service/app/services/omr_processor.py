from pathlib import Path

import cv2
import numpy as np

from app.config.omr_layout import (
    ALTERNATIVAS,
    CANONICAL_HEIGHT,
    CANONICAL_WIDTH,
    DNI_X,
    DNI_Y,
    MARCADOR_INF_DER,
    MARCADOR_INF_IZQ,
    MARCADOR_SUP_DER,
    MARCADOR_SUP_IZQ,
    MARCADORES_LATERALES_X,
    MARCADORES_LATERALES_Y,
    MARGEN_ROI_MARCADOR_X,
    MARGEN_ROI_MARCADOR_Y,
    RADIO_LECTURA,
    REGISTRO_CENTRAL_X,
    REGISTRO_CENTRAL_Y,
    RESPUESTAS_X_1,
    RESPUESTAS_X_2,
    RESPUESTAS_X_3,
    RESPUESTAS_X_4,
    RESPUESTAS_Y,
    TAMANO_VENTANA_MARCADOR,
    UMBRAL_MARCA,
    UMBRAL_OSCURIDAD_MARCADOR,
)


class OMRProcessor:

    def __init__(self):

        self.debug_dir = Path(
            "debug"
        )

        self.debug_dir.mkdir(
            exist_ok=True
        )

    # =========================================================
    # ORDENAR 4 PUNTOS
    #
    # Resultado:
    #
    # 0 = superior izquierda
    # 1 = superior derecha
    # 2 = inferior derecha
    # 3 = inferior izquierda
    # =========================================================

    def ordenar_puntos(
        self,
        puntos: np.ndarray,
    ) -> np.ndarray:

        puntos = np.array(
            puntos,
            dtype=np.float32,
        ).reshape(
            4,
            2,
        )

        resultado = np.zeros(
            (
                4,
                2,
            ),
            dtype=np.float32,
        )

        suma = puntos.sum(
            axis=1
        )

        diferencia = np.diff(
            puntos,
            axis=1,
        ).reshape(
            -1
        )

        resultado[0] = puntos[
            np.argmin(
                suma
            )
        ]

        resultado[2] = puntos[
            np.argmax(
                suma
            )
        ]

        resultado[1] = puntos[
            np.argmin(
                diferencia
            )
        ]

        resultado[3] = puntos[
            np.argmax(
                diferencia
            )
        ]

        return resultado

    # =========================================================
    # DETECTAR HOJA
    #
    # Esta es la primera detección aproximada.
    # =========================================================

    def detectar_documento(
        self,
        imagen: np.ndarray,
    ) -> np.ndarray:

        gris = cv2.cvtColor(
            imagen,
            cv2.COLOR_BGR2GRAY,
        )

        gris = cv2.GaussianBlur(
            gris,
            (
                5,
                5,
            ),
            0,
        )

        bordes = cv2.Canny(
            gris,
            50,
            180,
        )

        contornos, _ = (
            cv2.findContours(
                bordes,
                cv2.RETR_LIST,
                cv2.CHAIN_APPROX_SIMPLE,
            )
        )

        contornos = sorted(
            contornos,
            key=cv2.contourArea,
            reverse=True,
        )

        area_imagen = (
            imagen.shape[0]
            * imagen.shape[1]
        )

        for contorno in contornos[:50]:

            perimetro = (
                cv2.arcLength(
                    contorno,
                    True,
                )
            )

            aproximacion = (
                cv2.approxPolyDP(
                    contorno,
                    0.02 * perimetro,
                    True,
                )
            )

            if (
                len(
                    aproximacion
                )
                != 4
            ):
                continue

            area = cv2.contourArea(
                aproximacion
            )

            if (
                area
                < area_imagen * 0.20
            ):
                continue

            return aproximacion

        raise ValueError(
            "No se pudo detectar "
            "el contorno general de la hoja."
        )

    # =========================================================
    # PRIMERA CORRECCION DE PERSPECTIVA
    # =========================================================

    def transformar_perspectiva(
        self,
        imagen: np.ndarray,
        puntos: np.ndarray,
    ) -> np.ndarray:

        rect = self.ordenar_puntos(
            puntos
        )

        (
            superior_izquierda,
            superior_derecha,
            inferior_derecha,
            inferior_izquierda,
        ) = rect

        ancho_superior = (
            np.linalg.norm(
                superior_derecha
                - superior_izquierda
            )
        )

        ancho_inferior = (
            np.linalg.norm(
                inferior_derecha
                - inferior_izquierda
            )
        )

        ancho = int(
            max(
                ancho_superior,
                ancho_inferior,
            )
        )

        alto_izquierdo = (
            np.linalg.norm(
                inferior_izquierda
                - superior_izquierda
            )
        )

        alto_derecho = (
            np.linalg.norm(
                inferior_derecha
                - superior_derecha
            )
        )

        alto = int(
            max(
                alto_izquierdo,
                alto_derecho,
            )
        )

        if (
            ancho <= 0
            or alto <= 0
        ):

            raise ValueError(
                "No se pudo calcular "
                "el tamaño de la hoja."
            )

        destino = np.array(
            [
                [
                    0,
                    0,
                ],
                [
                    ancho - 1,
                    0,
                ],
                [
                    ancho - 1,
                    alto - 1,
                ],
                [
                    0,
                    alto - 1,
                ],
            ],
            dtype=np.float32,
        )

        matriz = (
            cv2.getPerspectiveTransform(
                rect,
                destino,
            )
        )

        hoja = cv2.warpPerspective(
            imagen,
            matriz,
            (
                ancho,
                alto,
            ),
        )

        return hoja

    # =========================================================
    # BINARIZACION
    #
    # Diseñada para tolerar:
    #
    # - sombra
    # - iluminación irregular
    # - fotografías tomadas con celular
    # =========================================================

    def binarizar(
        self,
        imagen: np.ndarray,
    ) -> np.ndarray:

        gris = cv2.cvtColor(
            imagen,
            cv2.COLOR_BGR2GRAY,
        )

        gris = cv2.GaussianBlur(
            gris,
            (
                5,
                5,
            ),
            0,
        )

        binaria = (
            cv2.adaptiveThreshold(
                gris,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV,
                35,
                10,
            )
        )

        return binaria

    # =========================================================
    # DENSIDAD DE TINTA EN UNA REGION
    # =========================================================

    def densidad_region(
        self,
        binaria: np.ndarray,
        x: int,
        y: int,
        radio: int = 8,
    ) -> float:

        alto, ancho = (
            binaria.shape
        )

        x1 = max(
            0,
            x - radio,
        )

        x2 = min(
            ancho,
            x + radio + 1,
        )

        y1 = max(
            0,
            y - radio,
        )

        y2 = min(
            alto,
            y + radio + 1,
        )

        region = binaria[
            y1:y2,
            x1:x2
        ]

        if region.size == 0:
            return 0.0

        return float(
            np.count_nonzero(
                region
            )
            / region.size
        )

    # =========================================================
    # BUSCAR DENSIDAD CERCA DE UNA POSICION
    #
    # Permite cierta tolerancia antes de hacer
    # el registro fino.
    # =========================================================

    def densidad_maxima_cerca(
        self,
        binaria: np.ndarray,
        x: int,
        y: int,
        busqueda: int = 15,
        radio: int = 7,
    ) -> float:

        mejor = 0.0

        for dy in range(
            -busqueda,
            busqueda + 1,
            5,
        ):

            for dx in range(
                -busqueda,
                busqueda + 1,
                5,
            ):

                valor = (
                    self.densidad_region(
                        binaria,
                        x + dx,
                        y + dy,
                        radio,
                    )
                )

                if valor > mejor:
                    mejor = valor

        return mejor

    # =========================================================
    # PUNTUACION DE ORIENTACION
    # =========================================================

    def puntuar_orientacion(
        self,
        imagen: np.ndarray,
    ) -> float:

        binaria = self.binarizar(
            imagen
        )

        valores = []

        # -----------------------------------------------------
        # Marcas laterales
        # -----------------------------------------------------

        for x in MARCADORES_LATERALES_X:

            for y in MARCADORES_LATERALES_Y:

                valor = (
                    self.densidad_maxima_cerca(
                        binaria,
                        x,
                        y,
                        busqueda=12,
                        radio=6,
                    )
                )

                valores.append(
                    valor
                )

        # -----------------------------------------------------
        # Franjas centrales
        #
        # Les damos mayor peso porque ayudan
        # a distinguir el sentido correcto.
        # -----------------------------------------------------

        for x in REGISTRO_CENTRAL_X:

            for y in REGISTRO_CENTRAL_Y:

                valor = (
                    self.densidad_maxima_cerca(
                        binaria,
                        x,
                        y,
                        busqueda=15,
                        radio=6,
                    )
                )

                valores.extend(
                    [
                        valor,
                        valor,
                        valor,
                    ]
                )

        if not valores:
            return 0.0

        return float(
            np.mean(
                valores
            )
        )

    # =========================================================
    # ORIENTACION APROXIMADA
    #
    # Probamos:
    #
    # 0
    # 90 izquierda
    # 180
    # 90 derecha
    # =========================================================

    def normalizar_orientacion_aproximada(
        self,
        hoja: np.ndarray,
    ) -> tuple[
        np.ndarray,
        str,
        float,
    ]:

        candidatos = [
            (
                "0",
                hoja,
            ),
            (
                "90_ANTIHORARIO",
                cv2.rotate(
                    hoja,
                    cv2.ROTATE_90_COUNTERCLOCKWISE,
                ),
            ),
            (
                "180",
                cv2.rotate(
                    hoja,
                    cv2.ROTATE_180,
                ),
            ),
            (
                "90_HORARIO",
                cv2.rotate(
                    hoja,
                    cv2.ROTATE_90_CLOCKWISE,
                ),
            ),
        ]

        mejor_imagen = None
        mejor_orientacion = None
        mejor_score = -1.0

        for (
            nombre,
            candidato,
        ) in candidatos:

            normalizada = cv2.resize(
                candidato,
                (
                    CANONICAL_WIDTH,
                    CANONICAL_HEIGHT,
                ),
                interpolation=cv2.INTER_AREA,
            )

            score = (
                self.puntuar_orientacion(
                    normalizada
                )
            )

            if score > mejor_score:

                mejor_score = (
                    score
                )

                mejor_imagen = (
                    normalizada
                )

                mejor_orientacion = (
                    nombre
                )

        if (
            mejor_imagen is None
            or mejor_orientacion is None
        ):

            raise ValueError(
                "No se pudo determinar "
                "la orientación de la ficha."
            )

        return (
            mejor_imagen,
            mejor_orientacion,
            mejor_score,
        )

    # =========================================================
    # BUSCAR UN MARCADOR NEGRO DENTRO DE UNA ROI
    #
    # Ya no buscamos contornos cuadrados.
    #
    # Buscamos simplemente la ventana más oscura
    # cerca de la esquina esperada.
    # =========================================================

    def buscar_marcador_en_roi(
        self,
        gris: np.ndarray,
        esperado_x: int,
        esperado_y: int,
        nombre: str,
    ) -> tuple[
        np.ndarray,
        tuple[
            int,
            int,
            int,
            int,
        ],
        float,
    ]:

        alto, ancho = (
            gris.shape
        )

        x1 = max(
            0,
            esperado_x
            - MARGEN_ROI_MARCADOR_X,
        )

        y1 = max(
            0,
            esperado_y
            - MARGEN_ROI_MARCADOR_Y,
        )

        x2 = min(
            ancho,
            esperado_x
            + MARGEN_ROI_MARCADOR_X,
        )

        y2 = min(
            alto,
            esperado_y
            + MARGEN_ROI_MARCADOR_Y,
        )

        roi = gris[
            y1:y2,
            x1:x2
        ]

        if roi.size == 0:

            raise ValueError(
                f"ROI inválida para "
                f"{nombre}."
            )

        ventana = (
            TAMANO_VENTANA_MARCADOR
        )

        medias = cv2.boxFilter(
            roi,
            ddepth=cv2.CV_32F,
            ksize=(
                ventana,
                ventana,
            ),
            normalize=True,
            borderType=cv2.BORDER_REPLICATE,
        )

        mitad = (
            ventana // 2
        )

        if (
            medias.shape[0]
            <= mitad * 2
            or medias.shape[1]
            <= mitad * 2
        ):

            raise ValueError(
                f"ROI demasiado pequeña "
                f"para {nombre}."
            )

        zona_valida = medias[
            mitad:-mitad,
            mitad:-mitad
        ]

        (
            valor_minimo,
            _,
            ubicacion_minima,
            _,
        ) = cv2.minMaxLoc(
            zona_valida
        )

        centro_x = (
            x1
            + mitad
            + ubicacion_minima[0]
        )

        centro_y = (
            y1
            + mitad
            + ubicacion_minima[1]
        )

        if (
            valor_minimo
            > UMBRAL_OSCURIDAD_MARCADOR
        ):

            raise ValueError(
                f"No se encontró "
                f"el marcador {nombre}. "
                f"Intensidad media="
                f"{valor_minimo:.1f}"
            )

        marcador = np.array(
            [
                centro_x,
                centro_y,
            ],
            dtype=np.float32,
        )

        return (
            marcador,
            (
                x1,
                y1,
                x2,
                y2,
            ),
            float(
                valor_minimo
            ),
        )

    # =========================================================
    # DETECTAR LOS 4 MARCADORES
    #
    # Cada uno se busca exclusivamente
    # dentro de su propia esquina.
    # =========================================================

    def detectar_marcadores_por_roi(
        self,
        hoja: np.ndarray,
    ) -> np.ndarray:

        gris = cv2.cvtColor(
            hoja,
            cv2.COLOR_BGR2GRAY,
        )

        gris = cv2.GaussianBlur(
            gris,
            (
                3,
                3,
            ),
            0,
        )

        configuracion = [
            (
                "SUP-IZQ",
                MARCADOR_SUP_IZQ,
            ),
            (
                "SUP-DER",
                MARCADOR_SUP_DER,
            ),
            (
                "INF-DER",
                MARCADOR_INF_DER,
            ),
            (
                "INF-IZQ",
                MARCADOR_INF_IZQ,
            ),
        ]

        seleccionados = []

        debug = hoja.copy()

        for (
            nombre,
            esperado,
        ) in configuracion:

            (
                esperado_x,
                esperado_y,
            ) = esperado

            (
                marcador,
                roi,
                intensidad,
            ) = (
                self.buscar_marcador_en_roi(
                    gris,
                    esperado_x,
                    esperado_y,
                    nombre,
                )
            )

            (
                x1,
                y1,
                x2,
                y2,
            ) = roi

            # ----------------------------------------------
            # Mostrar región de búsqueda
            # ----------------------------------------------

            cv2.rectangle(
                debug,
                (
                    x1,
                    y1,
                ),
                (
                    x2,
                    y2,
                ),
                (
                    255,
                    0,
                    255,
                ),
                2,
            )

            px = int(
                marcador[0]
            )

            py = int(
                marcador[1]
            )

            # ----------------------------------------------
            # Marcador elegido
            # ----------------------------------------------

            cv2.circle(
                debug,
                (
                    px,
                    py,
                ),
                18,
                (
                    0,
                    0,
                    255,
                ),
                3,
            )

            cv2.circle(
                debug,
                (
                    px,
                    py,
                ),
                5,
                (
                    0,
                    255,
                    0,
                ),
                -1,
            )

            cv2.putText(
                debug,
                (
                    f"{nombre} "
                    f"{intensidad:.0f}"
                ),
                (
                    px + 12,
                    py + 25,
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (
                    0,
                    0,
                    255,
                ),
                2,
            )

            seleccionados.append(
                marcador
            )

        cv2.imwrite(
            str(
                self.debug_dir
                / "ultima_marcadores.jpg"
            ),
            debug,
        )

        return np.array(
            seleccionados,
            dtype=np.float32,
        )

    # =========================================================
    # SEGUNDA HOMOGRAFIA
    #
    # Corrige los pequeños errores que quedaron
    # después de la primera detección del papel.
    # =========================================================

    def refinar_por_marcadores(
        self,
        hoja: np.ndarray,
        marcadores: np.ndarray,
    ) -> np.ndarray:

        # Orden recibido:
        #
        # TL
        # TR
        # BR
        # BL

        origen = np.array(
            marcadores,
            dtype=np.float32,
        )

        destino = np.array(
            [
                MARCADOR_SUP_IZQ,
                MARCADOR_SUP_DER,
                MARCADOR_INF_DER,
                MARCADOR_INF_IZQ,
            ],
            dtype=np.float32,
        )

        matriz = (
            cv2.getPerspectiveTransform(
                origen,
                destino,
            )
        )

        corregida = cv2.warpPerspective(
            hoja,
            matriz,
            (
                CANONICAL_WIDTH,
                CANONICAL_HEIGHT,
            ),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(
                255,
                255,
                255,
            ),
        )

        return corregida

    # =========================================================
    # PORCENTAJE DE TINTA DE UNA BURBUJA
    # =========================================================

    def porcentaje_tinta(
        self,
        binaria: np.ndarray,
        x: int,
        y: int,
        radio: int = RADIO_LECTURA,
    ) -> float:

        alto, ancho = (
            binaria.shape
        )

        x1 = max(
            0,
            x - radio,
        )

        x2 = min(
            ancho,
            x + radio + 1,
        )

        y1 = max(
            0,
            y - radio,
        )

        y2 = min(
            alto,
            y + radio + 1,
        )

        region = binaria[
            y1:y2,
            x1:x2
        ]

        if region.size == 0:
            return 0.0

        yy, xx = np.ogrid[
            :region.shape[0],
            :region.shape[1]
        ]

        centro_x = (
            x - x1
        )

        centro_y = (
            y - y1
        )

        mascara = (
            (xx - centro_x) ** 2
            + (yy - centro_y) ** 2
            <= radio ** 2
        )

        pixeles = region[
            mascara
        ]

        if pixeles.size == 0:
            return 0.0

        cantidad = (
            np.count_nonzero(
                pixeles
            )
        )

        return float(
            cantidad
            / pixeles.size
        )

    # =========================================================
    # LEER DNI
    # =========================================================

    def leer_dni(
        self,
        binaria: np.ndarray,
        debug: np.ndarray,
    ) -> tuple[
        str | None,
        list[str],
    ]:

        digitos = []

        errores = []

        for columna, x in enumerate(
            DNI_X
        ):

            porcentajes = []

            for digito, y in enumerate(
                DNI_Y
            ):

                porcentaje = (
                    self.porcentaje_tinta(
                        binaria,
                        x,
                        y,
                    )
                )

                porcentajes.append(
                    porcentaje
                )

                marcada = (
                    porcentaje
                    >= UMBRAL_MARCA
                )

                color = (
                    (
                        0,
                        255,
                        0,
                    )
                    if marcada
                    else (
                        255,
                        0,
                        0,
                    )
                )

                cv2.circle(
                    debug,
                    (
                        x,
                        y,
                    ),
                    RADIO_LECTURA + 3,
                    color,
                    1,
                )

            candidatos = [
                indice
                for (
                    indice,
                    valor,
                )
                in enumerate(
                    porcentajes
                )
                if (
                    valor
                    >= UMBRAL_MARCA
                )
            ]

            if len(
                candidatos
            ) == 1:

                digitos.append(
                    str(
                        candidatos[0]
                    )
                )

            elif len(
                candidatos
            ) == 0:

                maximo = max(
                    porcentajes
                )

                errores.append(
                    (
                        f"DNI columna "
                        f"{columna + 1}: "
                        f"sin marca "
                        f"(máximo="
                        f"{maximo:.3f})"
                    )
                )

            else:

                errores.append(
                    (
                        f"DNI columna "
                        f"{columna + 1}: "
                        f"múltiples marcas"
                    )
                )

        if errores:

            return (
                None,
                errores,
            )

        return (
            "".join(
                digitos
            ),
            [],
        )

    # =========================================================
    # LEER UN BLOQUE DE 20 PREGUNTAS
    # =========================================================

    def leer_columna_respuestas(
        self,
        binaria: np.ndarray,
        debug: np.ndarray,
        xs: list[int],
        inicio: int,
    ) -> list[dict]:

        respuestas = []

        for (
            indice,
            y,
        ) in enumerate(
            RESPUESTAS_Y
        ):

            numero = (
                inicio
                + indice
            )

            marcas = []

            porcentajes = {}

            for (
                letra,
                x,
            ) in zip(
                ALTERNATIVAS,
                xs,
            ):

                porcentaje = (
                    self.porcentaje_tinta(
                        binaria,
                        x,
                        y,
                    )
                )

                porcentajes[
                    letra
                ] = porcentaje

                marcada = (
                    porcentaje
                    >= UMBRAL_MARCA
                )

                if marcada:

                    marcas.append(
                        letra
                    )

                color = (
                    (
                        0,
                        255,
                        0,
                    )
                    if marcada
                    else (
                        255,
                        0,
                        0,
                    )
                )

                cv2.circle(
                    debug,
                    (
                        x,
                        y,
                    ),
                    RADIO_LECTURA + 3,
                    color,
                    1,
                )

            if len(
                marcas
            ) == 0:

                tipo = (
                    "BLANCO"
                )

            elif len(
                marcas
            ) == 1:

                tipo = (
                    "UNICA"
                )

            else:

                tipo = (
                    "DOBLE"
                )

            respuestas.append(
                {
                    "numero":
                        numero,

                    "marcas":
                        marcas,

                    "tipo":
                        tipo,

                    "porcentajes": {
                        letra:
                            round(
                                valor,
                                3,
                            )
                        for (
                            letra,
                            valor,
                        )
                        in porcentajes.items()
                    },
                }
            )

        return respuestas

    # =========================================================
    # LEER LAS 80 PREGUNTAS
    # =========================================================

    def leer_respuestas(
        self,
        binaria: np.ndarray,
        debug: np.ndarray,
    ) -> list[dict]:

        bloque_1 = (
            self.leer_columna_respuestas(
                binaria,
                debug,
                RESPUESTAS_X_1,
                1,
            )
        )

        bloque_2 = (
            self.leer_columna_respuestas(
                binaria,
                debug,
                RESPUESTAS_X_2,
                21,
            )
        )

        bloque_3 = (
            self.leer_columna_respuestas(
                binaria,
                debug,
                RESPUESTAS_X_3,
                41,
            )
        )

        bloque_4 = (
            self.leer_columna_respuestas(
                binaria,
                debug,
                RESPUESTAS_X_4,
                61,
            )
        )

        return (
            bloque_1
            + bloque_2
            + bloque_3
            + bloque_4
        )

    # =========================================================
    # RESUMEN
    # =========================================================

    def obtener_resumen(
        self,
        respuestas: list[dict],
    ) -> dict:

        unicas = sum(
            1
            for respuesta
            in respuestas
            if (
                respuesta["tipo"]
                == "UNICA"
            )
        )

        blancas = sum(
            1
            for respuesta
            in respuestas
            if (
                respuesta["tipo"]
                == "BLANCO"
            )
        )

        dobles = sum(
            1
            for respuesta
            in respuestas
            if (
                respuesta["tipo"]
                == "DOBLE"
            )
        )

        return {
            "total":
                len(
                    respuestas
                ),

            "unicas":
                unicas,

            "blancas":
                blancas,

            "dobles":
                dobles,
        }

    # =========================================================
    # PROCESAMIENTO COMPLETO
    # =========================================================

    def procesar(
        self,
        contenido: bytes,
    ) -> dict:

        # -----------------------------------------------------
        # 1. Decodificar imagen
        # -----------------------------------------------------

        arreglo = np.frombuffer(
            contenido,
            dtype=np.uint8,
        )

        imagen = cv2.imdecode(
            arreglo,
            cv2.IMREAD_COLOR,
        )

        if imagen is None:

            raise ValueError(
                "La imagen enviada "
                "no es válida."
            )

        (
            alto_original,
            ancho_original,
        ) = imagen.shape[:2]

        # -----------------------------------------------------
        # 2. Detectar papel
        # -----------------------------------------------------

        documento = (
            self.detectar_documento(
                imagen
            )
        )

        # -----------------------------------------------------
        # 3. Corrección inicial
        # -----------------------------------------------------

        hoja_previa = (
            self.transformar_perspectiva(
                imagen,
                documento,
            )
        )

        # -----------------------------------------------------
        # 4. Determinar orientación
        # -----------------------------------------------------

        (
            hoja_aproximada,
            orientacion,
            score_orientacion,
        ) = (
            self.normalizar_orientacion_aproximada(
                hoja_previa
            )
        )

        # Guardar antes del ajuste fino.
        cv2.imwrite(
            str(
                self.debug_dir
                / "ultima_aproximada.jpg"
            ),
            hoja_aproximada,
        )

        # -----------------------------------------------------
        # 5. Buscar marcadores y corregir
        # -----------------------------------------------------

        metodo_normalizacion = (
            "ROI_MARCADORES"
        )

        error_marcadores = None

        marcadores = None

        try:

            marcadores = (
                self.detectar_marcadores_por_roi(
                    hoja_aproximada
                )
            )

            hoja = (
                self.refinar_por_marcadores(
                    hoja_aproximada,
                    marcadores,
                )
            )

        except ValueError as error:

            error_marcadores = str(
                error
            )

            metodo_normalizacion = (
                "CONTORNO_SOLAMENTE"
            )

            # Importante:
            # NO deformamos nuevamente la hoja.
            hoja = (
                hoja_aproximada
            )

        # -----------------------------------------------------
        # 6. Binarizar
        # -----------------------------------------------------

        binaria = (
            self.binarizar(
                hoja
            )
        )

        debug = (
            hoja.copy()
        )

        # -----------------------------------------------------
        # 7. Leer DNI
        # -----------------------------------------------------

        (
            dni,
            errores_dni,
        ) = (
            self.leer_dni(
                binaria,
                debug,
            )
        )

        # -----------------------------------------------------
        # 8. Leer respuestas
        # -----------------------------------------------------

        respuestas = (
            self.leer_respuestas(
                binaria,
                debug,
            )
        )

        resumen = (
            self.obtener_resumen(
                respuestas
            )
        )

        # -----------------------------------------------------
        # 9. Guardar debug
        # -----------------------------------------------------

        cv2.imwrite(
            str(
                self.debug_dir
                / "ultima_normalizada.jpg"
            ),
            hoja,
        )

        cv2.imwrite(
            str(
                self.debug_dir
                / "ultima_binaria.jpg"
            ),
            binaria,
        )

        cv2.imwrite(
            str(
                self.debug_dir
                / "ultima_deteccion.jpg"
            ),
            debug,
        )

        # -----------------------------------------------------
        # 10. Marcadores para JSON
        # -----------------------------------------------------

        marcadores_json = None

        if marcadores is not None:

            marcadores_json = [
                {
                    "x":
                        round(
                            float(
                                punto[0]
                            ),
                            2,
                        ),

                    "y":
                        round(
                            float(
                                punto[1]
                            ),
                            2,
                        ),
                }

                for punto
                in marcadores
            ]

        # -----------------------------------------------------
        # 11. Resultado
        # -----------------------------------------------------

        return {
            "documentoDetectado":
                True,

            "metodoNormalizacion":
                metodo_normalizacion,

            "errorMarcadores":
                error_marcadores,

            "orientacionDetectada":
                orientacion,

            "scoreOrientacion":
                round(
                    score_orientacion,
                    3,
                ),

            "marcadoresDetectados":
                marcadores_json,

            "imagenOriginal": {
                "ancho":
                    ancho_original,

                "alto":
                    alto_original,
            },

            "hojaNormalizada": {
                "ancho":
                    CANONICAL_WIDTH,

                "alto":
                    CANONICAL_HEIGHT,
            },

            "dni":
                dni,

            "dniValido":
                dni is not None,

            "erroresDni":
                errores_dni,

            "respuestas":
                respuestas,

            "resumen":
                resumen,

            "debug": {
                "aproximada":
                    "/omr/debug/aproximada",

                "marcadores":
                    "/omr/debug/marcadores",

                "normalizada":
                    "/omr/debug/normalizada",

                "binaria":
                    "/omr/debug/binaria",

                "deteccion":
                    "/omr/debug",
            },
        }