# Reglas de Negocio - SmartExam

## 1. Objetivo del sistema

SmartExam es una plataforma web para gestionar simulacros académicos, permitiendo registrar alumnos, administrar evaluaciones, generar carnets de participación, procesar fichas ópticas mediante cámara y generar resultados agrupados por carrera.

---

# 2. Usuarios del sistema

El sistema contará inicialmente con dos tipos de usuarios:

## Administrador

Responsable de la configuración general del sistema.

Puede:

- Gestionar usuarios.
- Gestionar permisos.
- Registrar carreras.
- Configurar bloques.
- Crear simulacros.
- Configurar reglas de puntaje.
- Visualizar resultados.

## Digitador

Usuario encargado del proceso operativo.

Puede:

- Registrar alumnos.
- Gestionar inscripciones.
- Generar carnets según permisos asignados.
- Procesar fichas ópticas.
- Revisar resultados.

---

# 3. Gestión de alumnos

Los alumnos NO son usuarios del sistema.

Un alumno:

- No inicia sesión.
- No tiene contraseña.
- Participa en simulacros mediante una inscripción.

La información del alumno contiene:

- DNI.
- Nombres.
- Apellidos.
- Información académica.

---

# 4. Inscripción al simulacro

La carrera elegida pertenece a la inscripción y no al alumno.

Motivo:

Un alumno puede elegir diferentes carreras en diferentes simulacros.

Ejemplo:

Simulacro 01:

- Carrera: Ingeniería Informática
- Bloque: A

Simulacro 02:

- Carrera: Medicina Humana
- Bloque: B

Cada inscripción conservará la información histórica utilizada en ese momento.

---

# 5. Carnet de participación

El carnet se genera ANTES del simulacro.

Su finalidad es acreditar que el alumno está inscrito.

Debe contener:

- Nombre del alumno.
- DNI.
- Carrera.
- Bloque.
- Ciclo.
- Fecha del simulacro.
- Identificación del simulacro.

El carnet podrá ser enviado mediante:

- Correo electrónico.
- WhatsApp.

---

# 6. Ficha óptica

La ficha será similar al modelo utilizado por universidades.

Características:

- Identificación del alumno mediante DNI marcado por burbujas.
- Respuestas mediante alternativas A, B, C, D y E.
- Soporte para simulacros de hasta 120 preguntas.

La ficha será procesada mediante cámara utilizando reconocimiento óptico de marcas (OMR).

---

# 7. Procesamiento de respuestas

Cada pregunta puede tener tres estados:

## Correcta

Obtiene puntaje según:

- Área de la pregunta.
- Bloque del alumno.

## Incorrecta

Incluye:

- Respuesta equivocada.
- Doble marcado.

Penalización:

-0.1 puntos.

## En blanco

No genera penalización.

Puntaje:

0 puntos.

---

# 8. Cálculo de puntaje

El puntaje final será:

Puntaje por respuestas correctas
menos
penalización por respuestas incorrectas.

La ponderación depende del bloque.

Ejemplo:

Bloque A:

- Comunicación: 2 puntos.
- Matemática: 4 puntos.
- Ciencia: 3 puntos.
- Sociales: 1 punto.

---

# 9. Resultados

Los resultados serán internos de la academia.

No se manejará:

- Ingresantes.
- Vacantes.
- Admisión universitaria.

Los resultados se mostrarán:

- Por carrera.
- Ordenados por puntaje.
- Con ranking interno.

---

# 10. Tecnología de procesamiento

El sistema estará dividido en:

Frontend:

- Next.js.
- TypeScript.

Backend:

- NestJS.
- TypeScript.

Base de datos:

- PostgreSQL.
- Prisma ORM.

Procesamiento de imágenes:

- Python.
- OpenCV.
