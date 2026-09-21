import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import PDFDocument from 'pdfkit';

import * as nodemailer from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CarnetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // =========================================================
  // OBTENER DATOS DEL CARNET
  // =========================================================

  async obtenerDatosCarnet(inscripcionId: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
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
      throw new NotFoundException('La inscripción indicada no existe');
    }

    if (!inscripcion.estado) {
      throw new BadRequestException('La inscripción se encuentra inactiva');
    }

    const academia =
      this.configService.get<string>('ACADEMIA_NOMBRE') ?? 'SmartExam';

    const codigoCarnet = `SE-${inscripcion.id.toString().padStart(6, '0')}`;

    return {
      codigoCarnet,

      academia,

      alumno: {
        id: inscripcion.alumno.id,

        dni: inscripcion.alumno.dni,

        nombres: inscripcion.alumno.nombres,

        apellidos: inscripcion.alumno.apellidos,

        correo: inscripcion.alumno.correo,

        telefono: inscripcion.alumno.telefono,

        nombreCompleto: `${inscripcion.alumno.nombres} ${inscripcion.alumno.apellidos}`,
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

        totalPreguntas: inscripcion.simulacro.totalPreguntas,
      },

      ciclo: {
        id: inscripcion.simulacro.ciclo.id,

        nombre: inscripcion.simulacro.ciclo.nombre,
      },
    };
  }

  // =========================================================
  // GENERAR PDF
  // =========================================================

  async generarPdf(inscripcionId: number): Promise<Buffer> {
    const datos = await this.obtenerDatosCarnet(inscripcionId);

    return new Promise<Buffer>((resolve, reject) => {
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

      // =====================================================
      // CABECERA
      // =====================================================

      doc.rect(0, 0, doc.page.width, 95).fill('#0F5BD8');

      doc
        .fillColor('#FFFFFF')
        .fontSize(12)
        .text(datos.academia.toUpperCase(), 30, 25);

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('CARNET DE POSTULANTE', 30, 48);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Ciclo ${datos.ciclo.nombre}`, 400, 30, {
          width: 140,
          align: 'right',
        });

      doc.fontSize(11).text(datos.codigoCarnet, 400, 50, {
        width: 140,
        align: 'right',
      });

      // =====================================================
      // CONTENIDO
      // =====================================================

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
        .text(datos.alumno.nombreCompleto.toUpperCase(), 35, y + 17);

      y += 65;

      // =====================================================
      // DNI
      // =====================================================

      doc.fillColor('#667085').fontSize(9).text('DNI', 35, y);

      doc
        .fillColor('#101828')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(datos.alumno.dni, 35, y + 16);

      // =====================================================
      // GRUPO
      // =====================================================

      doc
        .fillColor('#667085')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('GRUPO', 190, y);

      doc
        .fillColor('#101828')
        .fontSize(13)
        .text(datos.grupo.codigo, 190, y + 16);

      // =====================================================
      // SIMULACRO
      // =====================================================

      doc.fillColor('#667085').fontSize(9).text('SIMULACRO', 300, y);

      doc
        .fillColor('#101828')
        .fontSize(13)
        .text(`N.º ${datos.simulacro.numero}`, 300, y + 16);

      y += 65;

      // =====================================================
      // CARRERA
      // =====================================================

      doc.fillColor('#667085').fontSize(9).text('CARRERA', 35, y);

      doc
        .fillColor('#101828')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(datos.carrera.nombre, 35, y + 16, {
          width: 300,
        });

      // =====================================================
      // FECHA
      // =====================================================

      const fecha = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',

        month: '2-digit',

        year: 'numeric',

        timeZone: 'America/Lima',
      }).format(datos.simulacro.fecha);

      doc.fillColor('#667085').fontSize(9).text('FECHA', 400, y);

      doc
        .fillColor('#101828')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(fecha, 400, y + 16);

      // =====================================================
      // PIE
      // =====================================================

      doc.roundedRect(35, 330, 510, 40, 8).fill('#F2F6FC');

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
    });
  }

  // =========================================================
  // ENVIAR CARNET POR CORREO
  // =========================================================

  async enviarCarnetPorCorreo(inscripcionId: number) {
    const datos = await this.obtenerDatosCarnet(inscripcionId);

    // =======================================================
    // VALIDAR CORREO DEL ALUMNO
    // =======================================================

    if (!datos.alumno.correo) {
      throw new BadRequestException(
        'El alumno no tiene un correo electrónico registrado.',
      );
    }

    // =======================================================
    // CONFIGURACIÓN SMTP
    // =======================================================

    const smtpHost = this.configService.get<string>('SMTP_HOST');

    const smtpPort = Number(
      this.configService.get<string>('SMTP_PORT') ?? '587',
    );

    const smtpUser = this.configService.get<string>('SMTP_USER');

    const smtpPass = this.configService.get<string>('SMTP_PASS');

    const smtpFrom = this.configService.get<string>('SMTP_FROM');

    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      throw new InternalServerErrorException(
        'El servicio de correo no se encuentra configurado.',
      );
    }

    // =======================================================
    // GENERAR PDF
    // =======================================================

    const pdf = await this.generarPdf(inscripcionId);

    const nombreArchivo = `Carnet_${datos.codigoCarnet}.pdf`;

    // =======================================================
    // TRANSPORTER SMTP
    // =======================================================

    const transporter = nodemailer.createTransport({
      host: smtpHost,

      port: smtpPort,

      secure: smtpSecure,

      auth: {
        user: smtpUser,

        pass: smtpPass,
      },
    });

    // =======================================================
    // FECHA
    // =======================================================

    const fecha = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',

      month: '2-digit',

      year: 'numeric',

      timeZone: 'America/Lima',
    }).format(datos.simulacro.fecha);

    // =======================================================
    // ENVIAR
    // =======================================================

    try {
      await transporter.sendMail({
        from: smtpFrom,

        to: datos.alumno.correo,

        subject: `Carnet de postulante - Simulacro N.º ${datos.simulacro.numero}`,

        text: `Hola ${datos.alumno.nombres},

Adjuntamos tu carnet de postulante para el Simulacro N.º ${datos.simulacro.numero}.

Carrera: ${datos.carrera.nombre}
Grupo: ${datos.grupo.codigo}
Fecha: ${fecha}
Código de carnet: ${datos.codigoCarnet}

Presenta este carnet el día del simulacro.

${datos.academia}`,

        html: `
          <div style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #1e293b;
          ">

            <div style="
              background: #0F5BD8;
              color: white;
              padding: 24px;
              border-radius: 12px 12px 0 0;
            ">

              <h2 style="
                margin: 0;
                font-size: 22px;
              ">
                ${datos.academia}
              </h2>

              <p style="
                margin: 6px 0 0;
                opacity: .9;
              ">
                Carnet de postulante
              </p>

            </div>


            <div style="
              border: 1px solid #e2e8f0;
              border-top: none;
              padding: 24px;
              border-radius: 0 0 12px 12px;
            ">

              <p>
                Hola <strong>${datos.alumno.nombreCompleto}</strong>,
              </p>

              <p>
                Adjuntamos tu carnet correspondiente al
                <strong>Simulacro N.º ${datos.simulacro.numero}</strong>.
              </p>


              <table style="
                width: 100%;
                margin: 20px 0;
                border-collapse: collapse;
              ">

                <tr>
                  <td style="padding: 8px 0; color: #64748b;">
                    Carrera
                  </td>

                  <td style="padding: 8px 0; font-weight: 600;">
                    ${datos.carrera.nombre}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 8px 0; color: #64748b;">
                    Grupo
                  </td>

                  <td style="padding: 8px 0; font-weight: 600;">
                    ${datos.grupo.codigo}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 8px 0; color: #64748b;">
                    Fecha
                  </td>

                  <td style="padding: 8px 0; font-weight: 600;">
                    ${fecha}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 8px 0; color: #64748b;">
                    Código
                  </td>

                  <td style="padding: 8px 0; font-weight: 600;">
                    ${datos.codigoCarnet}
                  </td>
                </tr>

              </table>


              <div style="
                background: #f8fafc;
                padding: 14px;
                border-radius: 8px;
                font-size: 14px;
                color: #475569;
              ">
                Presenta el carnet adjunto el día del simulacro.
              </div>

            </div>

          </div>
        `,

        attachments: [
          {
            filename: nombreArchivo,

            content: pdf,

            contentType: 'application/pdf',
          },
        ],
      });

      return {
        mensaje: 'Carnet enviado correctamente por correo.',

        destinatario: datos.alumno.correo,

        alumno: datos.alumno.nombreCompleto,

        codigoCarnet: datos.codigoCarnet,
      };
    } catch (error) {
      console.error('Error enviando carnet por correo:', error);

      throw new InternalServerErrorException(
        'No se pudo enviar el carnet por correo electrónico.',
      );
    }
  }

  async obtenerDatosWhatsApp(inscripcionId: number) {
    const datos = await this.obtenerDatosCarnet(inscripcionId);

    if (!datos.alumno.telefono) {
      throw new BadRequestException(
        'El alumno no tiene un número de teléfono registrado.',
      );
    }

    /*
    Nos quedamos únicamente con dígitos.
  */

    let telefono = datos.alumno.telefono.replace(/\D/g, '');

    /*
    Para números peruanos guardados con 9 dígitos,
    agregamos automáticamente el código 51.
  */

    if (telefono.length === 9) {
      telefono = `51${telefono}`;
    }

    const fecha = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Lima',
    }).format(datos.simulacro.fecha);

    const mensaje = `Hola ${datos.alumno.nombres}, te enviamos tu carnet de postulante para el Simulacro N.º ${datos.simulacro.numero}.

Carrera: ${datos.carrera.nombre}
Grupo: ${datos.grupo.codigo}
Fecha: ${fecha}
Código: ${datos.codigoCarnet}

Presenta tu carnet el día del simulacro.

${datos.academia}`;

    return {
      telefono,

      mensaje,

      alumno: datos.alumno.nombreCompleto,

      codigoCarnet: datos.codigoCarnet,

      nombreArchivo: `Carnet_${datos.codigoCarnet}.pdf`,
    };
  }
}
