import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // =====================================================
  // ROLES
  // =====================================================

  const administrador = await prisma.rol.upsert({
    where: {
      nombre: 'Administrador',
    },
    update: {},
    create: {
      nombre: 'Administrador',
    },
  });

  const digitador = await prisma.rol.upsert({
    where: {
      nombre: 'Digitador',
    },
    update: {},
    create: {
      nombre: 'Digitador',
    },
  });

  // =====================================================
  // PERMISOS
  // =====================================================

  const permisos = [
    'GESTIONAR_USUARIOS',
    'GESTIONAR_CARRERAS',
    'CREAR_SIMULACRO',
    'REGISTRAR_ALUMNOS',
    'GESTIONAR_INSCRIPCIONES',
    'GENERAR_CARNETS',
    'PROCESAR_FICHAS',
    'VER_RESULTADOS',

    // Los creamos desde ahora,
    // pero NO se los damos al digitador por defecto.
    'ENVIAR_CARNET_CORREO',
    'ENVIAR_CARNET_WHATSAPP',
  ];

  const permisosDB: Record<string, number> = {};

  for (const nombre of permisos) {
    const permiso = await prisma.permiso.upsert({
      where: {
        nombre,
      },
      update: {},
      create: {
        nombre,
      },
    });

    permisosDB[nombre] = permiso.id;
  }

  // Administrador: todos los permisos
  for (const nombre of permisos) {
    await prisma.rolPermiso.upsert({
      where: {
        rolId_permisoId: {
          rolId: administrador.id,
          permisoId: permisosDB[nombre],
        },
      },
      update: {},
      create: {
        rolId: administrador.id,
        permisoId: permisosDB[nombre],
      },
    });
  }

  // Digitador: permisos operativos
  const permisosDigitador = [
    'REGISTRAR_ALUMNOS',
    'GESTIONAR_INSCRIPCIONES',
    'GENERAR_CARNETS',
    'PROCESAR_FICHAS',
    'VER_RESULTADOS',
  ];

  for (const nombre of permisosDigitador) {
    await prisma.rolPermiso.upsert({
      where: {
        rolId_permisoId: {
          rolId: digitador.id,
          permisoId: permisosDB[nombre],
        },
      },
      update: {},
      create: {
        rolId: digitador.id,
        permisoId: permisosDB[nombre],
      },
    });
  }

  // =====================================================
  // USUARIOS DE DESARROLLO
  // =====================================================

  const passwordAdmin = await bcrypt.hash('Admin123*', 10);
  const passwordDigitador = await bcrypt.hash('Digitador123*', 10);

  await prisma.usuario.upsert({
    where: {
      correo: 'admin@smartexam.com',
    },
    update: {
      nombre: 'Administrador SmartExam',
      passwordHash: passwordAdmin,
      rolId: administrador.id,
      estado: true,
    },
    create: {
      nombre: 'Administrador SmartExam',
      correo: 'admin@smartexam.com',
      passwordHash: passwordAdmin,
      rolId: administrador.id,
    },
  });

  await prisma.usuario.upsert({
    where: {
      correo: 'digitador@smartexam.com',
    },
    update: {
      nombre: 'Digitador SmartExam',
      passwordHash: passwordDigitador,
      rolId: digitador.id,
      estado: true,
    },
    create: {
      nombre: 'Digitador SmartExam',
      correo: 'digitador@smartexam.com',
      passwordHash: passwordDigitador,
      rolId: digitador.id,
    },
  });

  // =====================================================
  // GRUPOS A, B, C, D
  // =====================================================

  const grupos = [
    { codigo: 'A', nombre: 'Grupo A' },
    { codigo: 'B', nombre: 'Grupo B' },
    { codigo: 'C', nombre: 'Grupo C' },
    { codigo: 'D', nombre: 'Grupo D' },
  ];

  const gruposDB: Record<string, number> = {};

  for (const item of grupos) {
    const grupo = await prisma.grupo.upsert({
      where: {
        codigo: item.codigo,
      },
      update: {
        nombre: item.nombre,
      },
      create: item,
    });

    gruposDB[item.codigo] = grupo.id;
  }

  // =====================================================
  // ÁREAS DEL EXAMEN
  //
  // 80 preguntas actualmente:
  // 20 Comunicación
  // 20 Matemática
  // 20 Ciencia
  // 20 Sociales
  // =====================================================

  const areas = [
    {
      clave: 'COMUNICACION',
      nombre: 'Comunicación en lengua materna',
    },
    {
      clave: 'MATEMATICA',
      nombre: 'Matemática razonada',
    },
    {
      clave: 'CIENCIA',
      nombre: 'Ciencia, tecnología y ambiente',
    },
    {
      clave: 'SOCIALES',
      nombre: 'Ciencias sociales, persona y relaciones humanas',
    },
  ];

  const areasDB: Record<string, number> = {};

  for (const item of areas) {
    const area = await prisma.area.upsert({
      where: {
        nombre: item.nombre,
      },
      update: {},
      create: {
        nombre: item.nombre,
      },
    });

    areasDB[item.clave] = area.id;
  }

  // =====================================================
  // MATRIZ DE PUNTAJES
  // =====================================================

  const reglas = [
    // GRUPO A
    { grupo: 'A', area: 'COMUNICACION', correcta: 2 },
    { grupo: 'A', area: 'MATEMATICA', correcta: 4 },
    { grupo: 'A', area: 'CIENCIA', correcta: 3 },
    { grupo: 'A', area: 'SOCIALES', correcta: 1 },

    // GRUPO B
    { grupo: 'B', area: 'COMUNICACION', correcta: 2 },
    { grupo: 'B', area: 'MATEMATICA', correcta: 3 },
    { grupo: 'B', area: 'CIENCIA', correcta: 4 },
    { grupo: 'B', area: 'SOCIALES', correcta: 1 },

    // GRUPO C
    { grupo: 'C', area: 'COMUNICACION', correcta: 4 },
    { grupo: 'C', area: 'MATEMATICA', correcta: 2 },
    { grupo: 'C', area: 'CIENCIA', correcta: 1 },
    { grupo: 'C', area: 'SOCIALES', correcta: 3 },

    // GRUPO D
    { grupo: 'D', area: 'COMUNICACION', correcta: 3 },
    { grupo: 'D', area: 'MATEMATICA', correcta: 2 },
    { grupo: 'D', area: 'CIENCIA', correcta: 1 },
    { grupo: 'D', area: 'SOCIALES', correcta: 4 },
  ];

  for (const regla of reglas) {
    const grupoId = gruposDB[regla.grupo];
    const areaId = areasDB[regla.area];

    await prisma.reglaPuntaje.upsert({
      where: {
        grupoId_areaId: {
          grupoId,
          areaId,
        },
      },
      update: {
        puntajeCorrecta: regla.correcta,
        puntajeIncorrecta: -0.1,
        puntajeBlanco: 0,
      },
      create: {
        grupoId,
        areaId,
        puntajeCorrecta: regla.correcta,
        puntajeIncorrecta: -0.1,
        puntajeBlanco: 0,
      },
    });
  }

  console.log('Seed completado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });