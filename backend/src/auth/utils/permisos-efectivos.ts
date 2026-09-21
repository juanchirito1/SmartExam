import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

export async function obtenerPermisosEfectivos(
  prisma: PrismaService,
  usuarioId: number,
): Promise<string[]> {
  const ahora = new Date();

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },

    include: {
      rol: {
        include: {
          permisos: {
            include: {
              permiso: true,
            },
          },
        },
      },

      permisosTemporales: {
        where: {
          estado: true,

          fechaInicio: {
            lte: ahora,
          },

          fechaFin: {
            gt: ahora,
          },
        },

        include: {
          permiso: true,
        },
      },
    },
  });

  if (!usuario || !usuario.estado) {
    throw new UnauthorizedException('Usuario no válido o inactivo.');
  }

  const permisosBase = usuario.rol.permisos.map((item) => item.permiso.nombre);

  const permisosTemporales = usuario.permisosTemporales.map(
    (item) => item.permiso.nombre,
  );

  /*
    Set evita permisos duplicados.
  */

  return [...new Set([...permisosBase, ...permisosTemporales])];
}
