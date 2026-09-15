import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CarnetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async obtenerDatosCarnet(inscripcionId: number) {
    const inscripcion =
      await this.prisma.inscripcion.findUnique({
        where: {
          id: inscripcionId,
        },

        include: {
          alumno: true,
          carrera: true,
          grupo: true,

          simulacro: {
            include: {
              ciclo: true,
            },
          },
        },
      });

    if (!inscripcion) {
      throw new NotFoundException(
        'La inscripción indicada no existe',
      );
    }

    if (!inscripcion.estado) {
      throw new BadRequestException(
        'La inscripción se encuentra inactiva',
      );
    }

    const academia =
      this.configService.get<string>(
        'ACADEMIA_NOMBRE',
      ) ?? 'SmartExam';

    const codigoCarnet =
      `SE-${inscripcion.id
        .toString()
        .padStart(6, '0')}`;

    return {
      codigoCarnet,

      academia,

      alumno: {
        id: inscripcion.alumno.id,
        dni: inscripcion.alumno.dni,

        nombres:
          inscripcion.alumno.nombres,

        apellidos:
          inscripcion.alumno.apellidos,

        nombreCompleto:
          `${inscripcion.alumno.nombres} ${inscripcion.alumno.apellidos}`,
      },

      carrera: {
        id: inscripcion.carrera.id,
        nombre: inscripcion.carrera.nombre,
      },

      grupo: {
        id: inscripcion.grupo.id,
        codigo: inscripcion.grupo.codigo,
        nombre: inscripcion.grupo.nombre,
      },

      simulacro: {
        id: inscripcion.simulacro.id,
        numero: inscripcion.simulacro.numero,
        fecha: inscripcion.simulacro.fecha,
        totalPreguntas:
          inscripcion.simulacro.totalPreguntas,
      },

      ciclo: {
        id: inscripcion.simulacro.ciclo.id,
        nombre:
          inscripcion.simulacro.ciclo.nombre,
      },
    };
  }

  async generarPdf(
    inscripcionId: number,
  ): Promise<Buffer> {
    const datos =
      await this.obtenerDatosCarnet(
        inscripcionId,
      );

    return new Promise<Buffer>(
      (resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A5',
          layout: 'landscape',
          margin: 30,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // ==========================================
        // CABECERA
        // ==========================================

        doc
          .rect(
            0,
            0,
            doc.page.width,
            95,
          )
          .fill('#0F5BD8');

        doc
          .fillColor('#FFFFFF')
          .fontSize(12)
          .text(
            datos.academia.toUpperCase(),
            30,
            25,
          );

        doc
          .fontSize(22)
          .font('Helvetica-Bold')
          .text(
            'CARNET DE POSTULANTE',
            30,
            48,
          );

        doc
          .fontSize(11)
          .font('Helvetica')
          .text(
            `Ciclo ${datos.ciclo.nombre}`,
            400,
            30,
            {
              width: 140,
              align: 'right',
            },
          );

        doc
          .fontSize(11)
          .text(
            datos.codigoCarnet,
            400,
            50,
            {
              width: 140,
              align: 'right',
            },
          );

        // ==========================================
        // CONTENIDO
        // ==========================================

        let y = 125;

        doc
          .fillColor('#667085')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('POSTULANTE', 35, y);

        doc
          .fillColor('#101828')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(
            datos.alumno.nombreCompleto
              .toUpperCase(),
            35,
            y + 17,
          );

        y += 65;

        // DNI
        doc
          .fillColor('#667085')
          .fontSize(9)
          .text('DNI', 35, y);

        doc
          .fillColor('#101828')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(
            datos.alumno.dni,
            35,
            y + 16,
          );

        // Grupo
        doc
          .fillColor('#667085')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('GRUPO', 190, y);

        doc
          .fillColor('#101828')
          .fontSize(13)
          .text(
            datos.grupo.codigo,
            190,
            y + 16,
          );

        // Simulacro
        doc
          .fillColor('#667085')
          .fontSize(9)
          .text('SIMULACRO', 300, y);

        doc
          .fillColor('#101828')
          .fontSize(13)
          .text(
            `N.º ${datos.simulacro.numero}`,
            300,
            y + 16,
          );

        y += 65;

        // Carrera
        doc
          .fillColor('#667085')
          .fontSize(9)
          .text('CARRERA', 35, y);

        doc
          .fillColor('#101828')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(
            datos.carrera.nombre,
            35,
            y + 16,
            {
              width: 300,
            },
          );

        // Fecha
        const fecha =
          new Intl.DateTimeFormat(
            'es-PE',
            {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'America/Lima',
            },
          ).format(
            datos.simulacro.fecha,
          );

        doc
          .fillColor('#667085')
          .fontSize(9)
          .text('FECHA', 400, y);

        doc
          .fillColor('#101828')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(
            fecha,
            400,
            y + 16,
          );

        // ==========================================
        // PIE
        // ==========================================

        doc
          .roundedRect(
            35,
            330,
            510,
            40,
            8,
          )
          .fill('#F2F6FC');

        doc
          .fillColor('#344054')
          .fontSize(10)
          .font('Helvetica')
          .text(
            'Presentar este carnet el día del simulacro. Documento interno de identificación.',
            50,
            344,
            {
              width: 480,
              align: 'center',
            },
          );

        doc.end();
      },
    );
  }
}