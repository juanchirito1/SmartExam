from pathlib import Path

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)

from fastapi.responses import (
    FileResponse,
)

from app.services.omr_processor import (
    OMRProcessor,
)


app = FastAPI(
    title="SmartExam OMR Service",
    version="3.2.0",
    description=(
        "Servicio de lectura óptica "
        "de fichas SmartExam."
    ),
)


processor = OMRProcessor()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "servicio":
            "SmartExam OMR",

        "version":
            "3.2.0",

        "estado":
            "activo",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status":
            "ok",
    }


# ============================================================
# PROCESAR FICHA
# ============================================================

@app.post("/omr/procesar")
async def procesar_ficha(
    archivo: UploadFile = File(...),
):

    if not archivo.content_type:

        raise HTTPException(
            status_code=400,
            detail=(
                "No se pudo determinar "
                "el tipo del archivo."
            ),
        )

    if not archivo.content_type.startswith(
        "image/"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Solo se permiten "
                "archivos de imagen."
            ),
        )

    contenido = (
        await archivo.read()
    )

    if not contenido:

        raise HTTPException(
            status_code=400,
            detail=(
                "La imagen enviada "
                "está vacía."
            ),
        )

    try:

        resultado = (
            processor.procesar(
                contenido
            )
        )

        return {
            "archivo":
                archivo.filename,

            **resultado,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(
                error
            ),
        )


# ============================================================
# AUXILIAR PARA ARCHIVOS DEBUG
# ============================================================

def devolver_debug(
    nombre_archivo: str,
):

    ruta = (
        Path("debug")
        / nombre_archivo
    )

    if not ruta.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                "Todavía no existe "
                f"el archivo "
                f"{nombre_archivo}."
            ),
        )

    return FileResponse(
        ruta,
        media_type="image/jpeg",
    )


# ============================================================
# DEBUG DETECCION FINAL
# ============================================================

@app.get("/omr/debug")
def debug_deteccion():

    return devolver_debug(
        "ultima_deteccion.jpg"
    )


# ============================================================
# DEBUG NORMALIZACION INICIAL
# ============================================================

@app.get(
    "/omr/debug/aproximada"
)
def debug_aproximada():

    return devolver_debug(
        "ultima_aproximada.jpg"
    )


# ============================================================
# DEBUG MARCADORES
# ============================================================

@app.get(
    "/omr/debug/marcadores"
)
def debug_marcadores():

    return devolver_debug(
        "ultima_marcadores.jpg"
    )


# ============================================================
# DEBUG NORMALIZADA FINAL
# ============================================================

@app.get(
    "/omr/debug/normalizada"
)
def debug_normalizada():

    return devolver_debug(
        "ultima_normalizada.jpg"
    )


# ============================================================
# DEBUG BINARIA
# ============================================================

@app.get(
    "/omr/debug/binaria"
)
def debug_binaria():

    return devolver_debug(
        "ultima_binaria.jpg"
    )