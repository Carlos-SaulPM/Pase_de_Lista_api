import prisma from "#/lib/prisma.js";
import { DiaDeLaSemana } from "@prisma/client";

export const listarHorariosPorClase = async (claseId: number) => {
  return prisma.horarioClase.findMany({ where: { claseId } });
};

export const obtenerHorarioPorId = async (id: number) => {
  return prisma.horarioClase.findUnique({
    where: { id },
    include: { clase: true },
  });
};

export const crearHorario = async (datos: {
  claseId: number;
  dia: number;
  diaDeLaSemana: DiaDeLaSemana;
  horaDeInicio: Date;
  horaDeFin: Date;
}) => {
  return prisma.horarioClase.create({
    data: datos,
    include: { clase: true },
  });
};

export const actualizarHorario = async (
  id: number,
  datos: Partial<{
    dia: number;
    diaDeLaSemana: DiaDeLaSemana;
    horaDeInicio: Date;
    horaDeFin: Date;
  }>,
) => {
  return prisma.horarioClase.update({ where: { id }, data: datos });
};

export const eliminarHorario = async (id: number) => {
  return prisma.horarioClase.delete({ where: { id } });
};

export const crearHorariosBatch = async (
  datos: {
    claseId: number;
    dia: number;
    diaDeLaSemana: DiaDeLaSemana;
    horaDeInicio: Date;
    horaDeFin: Date;
  }[],
) => {
  return prisma.horarioClase.createMany({ data: datos, skipDuplicates: false });
};

export const obtenerHorarioDeHoy = async (claseId: number, dia: number) => {
  return prisma.horarioClase.findFirst({
    where: { claseId, dia },
    select: { horaDeInicio: true, horaDeFin: true },
  });
};
