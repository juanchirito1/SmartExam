import { BadRequestException, Injectable } from '@nestjs/common';

import ExcelJS from 'exceljs';

import { PrismaService } from '../prisma/prisma.service.js';

interface AlumnoExcel {
  fila: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
}

export interface AlumnoPreview extends AlumnoExcel {
  valido: boolean;

  estado: 'VALIDO' | 'DUPLICADO' | 'ERROR';

  observacion: string | null;
}

@Injectable()
export class AlumnosExcelService {
  constructor(private readonly prisma: PrismaService) {}

  private obtenerTexto(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    if (
      typeof valor === 'string' ||
      typeof valor === 'number' ||
      typeof valor === 'boolean'
    ) {
      return String(valor).trim();
    }

    if (typeof valor === 'object') {
      const objeto = valor as {
        text?: unknown;

        richText?: {
          text?: unknown;
        }[];

        result?: unknown;
      };

      /*
      Excel puede devolver algunas celdas
      como texto enriquecido.
    */
      if (Array.isArray(objeto.richText)) {
        return objeto.richText
          .map((item) => (item.text !== undefined ? String(item.text) : ''))
          .join('')
          .trim();
      }

      /*
      Hipervínculos y otros tipos de celda
      pueden venir con propiedad text.
    */
      if (objeto.text !== undefined) {
        return this.obtenerTexto(objeto.text);
      }

      /*
      Las celdas con fórmula pueden devolver
      su contenido mediante result.
    */
      if (objeto.result !== undefined) {
        return this.obtenerTexto(objeto.result);
      }
    }

    return String(valor).trim();
  }

  private normalizarEncabezado(valor: unknown): string {
    return (
      this.obtenerTexto(valor)
        /*
      Elimina BOM invisible.
    */
        .replace(/\uFEFF/g, '')

        /*
      Convierte espacios especiales de Excel
      en espacios normales.
    */
        .replace(/\u00A0/g, ' ')

        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

        /*
      Compacta espacios duplicados.
    */
        .replace(/\s+/g, ' ')
    );
  }

  private normalizarCorreo(correo: string) {
    const valor = correo.trim().toLowerCase();

    return valor || null;
  }

  private normalizarTelefono(telefono: string) {
    const valor = telefono.trim();

    return valor || null;
  }

  async previsualizar(archivo: Express.Multer.File) {
    if (!archivo) {
      throw new BadRequestException('Debes seleccionar un archivo Excel.');
    }

    const extensionesPermitidas = ['.xlsx', '.xlsm'];

    const nombre = archivo.originalname.toLowerCase();

    if (
      !extensionesPermitidas.some((extension) => nombre.endsWith(extension))
    ) {
      throw new BadRequestException('El archivo debe estar en formato XLSX.');
    }

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(archivo.buffer as any);

    const hoja = workbook.worksheets[0];

    if (!hoja) {
      throw new BadRequestException('El archivo Excel no contiene hojas.');
    }

    /*
      Estructura esperada:

      A = DNI
      B = Nombres
      C = Apellidos
      D = Telefono
      E = Correo
    */

    const encabezados = hoja.getRow(1);

    const columnas = [
      this.normalizarEncabezado(encabezados.getCell(1).value),

      this.normalizarEncabezado(encabezados.getCell(2).value),

      this.normalizarEncabezado(encabezados.getCell(3).value),

      this.normalizarEncabezado(encabezados.getCell(4).value),

      this.normalizarEncabezado(encabezados.getCell(5).value),
    ];

    const esperadas = [
      {
        valor: 'dni',
        etiqueta: 'DNI',
      },
      {
        valor: 'nombres',
        etiqueta: 'Nombres',
      },
      {
        valor: 'apellidos',
        etiqueta: 'Apellidos',
      },
      {
        valor: 'telefono',
        etiqueta: 'Telefono',
      },
      {
        valor: 'correo',
        etiqueta: 'Correo',
      },
    ];

    for (let i = 0; i < esperadas.length; i++) {
      if (columnas[i] !== esperadas[i].valor) {
        throw new BadRequestException(
          `La columna ${i + 1} debe llamarse "${esperadas[i].etiqueta}".`,
        );
      }
    }

    const registros: AlumnoExcel[] = [];

    hoja.eachRow((row, numeroFila) => {
      if (numeroFila === 1) {
        return;
      }

      const dni = this.obtenerTexto(row.getCell(1).value);

      const nombres = this.obtenerTexto(row.getCell(2).value);

      const apellidos = this.obtenerTexto(row.getCell(3).value);

      const telefono = this.normalizarTelefono(
        this.obtenerTexto(row.getCell(4).value),
      );

      const correo = this.normalizarCorreo(
        this.obtenerTexto(row.getCell(5).value),
      );

      /*
          Ignorar filas completamente vacías.
        */

      if (!dni && !nombres && !apellidos && !telefono && !correo) {
        return;
      }

      registros.push({
        fila: numeroFila,
        dni,
        nombres,
        apellidos,
        telefono,
        correo,
      });
    });

    if (registros.length === 0) {
      throw new BadRequestException('El archivo no contiene alumnos.');
    }

    const dnis = registros.map((registro) => registro.dni).filter(Boolean);

    const existentes = await this.prisma.alumno.findMany({
      where: {
        dni: {
          in: dnis,
        },
      },

      select: {
        dni: true,
      },
    });

    const dnisExistentes = new Set(existentes.map((alumno) => alumno.dni));

    const repetidosArchivo = new Set<string>();

    const encontrados = new Set<string>();

    for (const registro of registros) {
      if (encontrados.has(registro.dni)) {
        repetidosArchivo.add(registro.dni);
      }

      encontrados.add(registro.dni);
    }

    const resultado: AlumnoPreview[] = registros.map((registro) => {
      if (!/^\d{8}$/.test(registro.dni)) {
        return {
          ...registro,
          valido: false,
          estado: 'ERROR',
          observacion: 'El DNI debe contener 8 dígitos.',
        };
      }

      if (!registro.nombres) {
        return {
          ...registro,
          valido: false,
          estado: 'ERROR',
          observacion: 'Los nombres son obligatorios.',
        };
      }

      if (!registro.apellidos) {
        return {
          ...registro,
          valido: false,
          estado: 'ERROR',
          observacion: 'Los apellidos son obligatorios.',
        };
      }

      if (
        registro.correo &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registro.correo)
      ) {
        return {
          ...registro,
          valido: false,
          estado: 'ERROR',
          observacion: 'El correo no tiene un formato válido.',
        };
      }

      if (dnisExistentes.has(registro.dni)) {
        return {
          ...registro,
          valido: false,
          estado: 'DUPLICADO',
          observacion: 'El DNI ya está registrado en SmartExam.',
        };
      }

      if (repetidosArchivo.has(registro.dni)) {
        return {
          ...registro,
          valido: false,
          estado: 'DUPLICADO',
          observacion: 'El DNI está repetido dentro del archivo.',
        };
      }

      return {
        ...registro,
        valido: true,
        estado: 'VALIDO',
        observacion: null,
      };
    });

    return {
      archivo: archivo.originalname,

      total: resultado.length,

      validos: resultado.filter((item) => item.estado === 'VALIDO').length,

      duplicados: resultado.filter((item) => item.estado === 'DUPLICADO')
        .length,

      errores: resultado.filter((item) => item.estado === 'ERROR').length,

      registros: resultado,
    };
  }

  async importar(alumnos: AlumnoExcel[]) {
    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      throw new BadRequestException(
        'No existen alumnos válidos para importar.',
      );
    }

    const dnis = alumnos.map((alumno) => alumno.dni);

    const existentes = await this.prisma.alumno.findMany({
      where: {
        dni: {
          in: dnis,
        },
      },

      select: {
        dni: true,
      },
    });

    const existentesSet = new Set(existentes.map((alumno) => alumno.dni));

    const nuevos = alumnos.filter(
      (alumno) =>
        /^\d{8}$/.test(alumno.dni) &&
        alumno.nombres &&
        alumno.apellidos &&
        !existentesSet.has(alumno.dni),
    );

    if (nuevos.length === 0) {
      throw new BadRequestException('No existen alumnos nuevos para importar.');
    }

    const resultado = await this.prisma.alumno.createMany({
      data: nuevos.map((alumno) => ({
        dni: alumno.dni,

        nombres: alumno.nombres.trim(),

        apellidos: alumno.apellidos.trim(),

        telefono: alumno.telefono?.trim() || null,

        correo: alumno.correo?.trim().toLowerCase() || null,

        estado: true,
      })),

      skipDuplicates: true,
    });

    return {
      mensaje: 'Importación completada.',

      importados: resultado.count,

      omitidos: alumnos.length - resultado.count,
    };
  }

  async exportar() {
    const alumnos = await this.prisma.alumno.findMany({
      orderBy: [
        {
          apellidos: 'asc',
        },
        {
          nombres: 'asc',
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'SmartExam';

    const hoja = workbook.addWorksheet('Alumnos');

    hoja.columns = [
      {
        header: 'DNI',
        key: 'dni',
        width: 14,
      },
      {
        header: 'Nombres',
        key: 'nombres',
        width: 28,
      },
      {
        header: 'Apellidos',
        key: 'apellidos',
        width: 30,
      },
      {
        header: 'Telefono',
        key: 'telefono',
        width: 18,
      },
      {
        header: 'Correo',
        key: 'correo',
        width: 35,
      },
      {
        header: 'Estado',
        key: 'estado',
        width: 14,
      },
    ];

    for (const alumno of alumnos) {
      hoja.addRow({
        dni: alumno.dni,

        nombres: alumno.nombres,

        apellidos: alumno.apellidos,

        telefono: alumno.telefono ?? '',

        correo: alumno.correo ?? '',

        estado: alumno.estado ? 'ACTIVO' : 'INACTIVO',
      });
    }

    const encabezado = hoja.getRow(1);

    encabezado.font = {
      bold: true,
    };

    hoja.autoFilter = {
      from: 'A1',
      to: 'F1',
    };

    hoja.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}
