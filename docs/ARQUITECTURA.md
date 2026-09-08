# Arquitectura del Sistema - SmartExam

## 1. Descripción general

SmartExam utiliza una arquitectura distribuida compuesta por tres aplicaciones principales:

- Frontend web.
- Backend API.
- Servicio de reconocimiento óptico de fichas.

La arquitectura busca separar responsabilidades y permitir crecimiento futuro del sistema.

---

# 2. Componentes del sistema


## Frontend

Tecnología:

- Next.js
- TypeScript
- Tailwind CSS

Responsabilidad:

- Interfaz para administradores y digitadores.
- Gestión de alumnos.
- Creación de simulacros.
- Captura de imágenes mediante cámara.
- Visualización de resultados.


---

## Backend

Tecnología:

- NestJS
- TypeScript
- Prisma ORM

Responsabilidad:

- Lógica del negocio.
- Autenticación.
- Gestión de usuarios.
- Gestión académica.
- Cálculo de puntajes.
- Generación de reportes.


---

## Base de datos

Tecnología:

- PostgreSQL

Responsabilidad:

Almacenar:

- Usuarios.
- Alumnos.
- Simulacros.
- Inscripciones.
- Resultados.
- Configuraciones.


---

## Servicio OMR

Tecnología:

- Python
- OpenCV
- FastAPI

Responsabilidad:

- Procesar imágenes de fichas ópticas.
- Detectar DNI mediante burbujas.
- Detectar respuestas.
- Identificar doble marcado.
- Retornar información procesada.


---

# 3. Flujo de procesamiento de ficha


1. Digitador abre la cámara desde el sistema.

2. Captura fotografía de la ficha.

3. Frontend envía imagen al backend.

4. Backend envía imagen al servicio OMR.

5. OMR procesa:

   - Identificación del alumno.
   - Respuestas marcadas.

6. Backend calcula:

   - respuestas correctas.
   - respuestas incorrectas.
   - penalizaciones.
   - puntaje final.

7. Se almacena el resultado.

8. Usuario visualiza ranking por carrera.


---

# 4. Estructura del repositorio


SmartExam

├── frontend

├── backend

├── omr-service

└── docs


---

# 5. Principios del diseño

- Separación de responsabilidades.
- Código mantenible.
- Escalabilidad futura.
- Seguridad.
- Reutilización de componentes.