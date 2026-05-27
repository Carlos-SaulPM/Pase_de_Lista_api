import prisma from "#/lib/prisma.js";
import crypto from "node:crypto";

function generarLlaveSecreta(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const listarClases = async () => {
  return prisma.clase.findMany({
    where: { estaActivo: true },
    include: { materia: true, profesor: true },
  });
};

export const obtenerClasePorId = async (id: number) => {
  return prisma.clase.findUnique({
    where: { id },
    include: { materia: true, profesor: true, configuracion: true },
  });
};

export const crearClase = async (datos: {
  materiaId: number;
  profesorId: number;
  grupo: string;
  periodo?: string;
  aula?: string;
}) => {
  const llaveSecreta = generarLlaveSecreta();

  return prisma.clase.create({
    data: {
      materiaId: datos.materiaId,
      profesorId: datos.profesorId,
      grupo: datos.grupo,
      periodo: datos.periodo ?? null,
      aula: datos.aula ?? null,
      fechaDeCreacion: new Date(),
      estaActivo: true,
      configuracion: {
        create: {
          llaveSecreta,
          minutosDeTolerancia: 10,
          segundosDeExpiracionDelToken: 300,
          distanciaRssi: -80,
        },
      },
    },
    include: { materia: true, profesor: true, configuracion: true },
  });
};

export const actualizarClase = async (
  id: number,
  datos: Partial<{
    materiaId: number;
    profesorId: number;
    grupo: string;
    periodo?: string;
    aula?: string;
    estaActivo: boolean;
  }>,
) => {
  return prisma.clase.update({ where: { id }, data: datos });
};

export const desactivarClase = async (id: number) => {
  return prisma.clase.update({
    where: { id },
    data: { estaActivo: false, fechaDeBaja: new Date() },
  });
};

export const obtenerClasePorGrupo = async (grupo: string) => {
  return prisma.clase.findFirst({
    where: { grupo, estaActivo: true },
  });
};

export const obtenerClasesPorProfesor = async (profesorId: number) => {
  return prisma.clase.findMany({
    where: {
      profesorId,
      estaActivo: true,
    },
    select: {
      id: true,
      materiaId: true,
      profesorId: true,
      grupo: true,
      periodo: true,
      materia: {
        select: {
          nombre: true,
          clave: true,
        },
      },
      configuracion: {
        omit: { llaveSecreta: true },
      },
      horarios: {
        select: {
          dia: true,
          diaDeLaSemana: true,
          horaDeInicio: true,
          horaDeFin: true,
        },
      },
    },
    orderBy: { fechaDeCreacion: "desc" },
  });
};
