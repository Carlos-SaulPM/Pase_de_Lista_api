import prisma from "#/lib/prisma.js";
import { EstadoAsistencia, MetodoAsistencia } from "@prisma/client";

export const listarAsistencias = async (filtros?: { claseId?: number; alumnoId?: number }) => {
  return prisma.asistencia.findMany({
    where: {
      ...(filtros?.claseId && { claseId: filtros.claseId }),
      ...(filtros?.alumnoId && { alumnoId: filtros.alumnoId }),
    },
    include: {
      clase: { select: { id: true, grupo: true } },
      alumno: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
    },
    orderBy: { fechaRegistro: "desc" },
  });
};

export const listarAlumnosConAsistencia = async (claseId: number) => {
  return prisma.asistencia.findMany({
    where: { claseId },
    include: { alumno: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    orderBy: { fechaRegistro: "desc" },
  });
};

export const obtenerAsistenciaPorId = async (id: number) => {
  return prisma.asistencia.findUnique({
    where: { id },
    include: {
      clase: { select: { id: true, grupo: true } },
      alumno: { select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
    },
  });
};

export const obtenerAsistencia = async (claseId: number, alumnoId: number) => {
  return prisma.asistencia.findFirst({
    where: { claseId, alumnoId },
    select: { id: true, estado: true, metodo: true },
  });
};

export const registrarAsistencia = async (datos: {
  claseId: number;
  alumnoId: number;
  estado: EstadoAsistencia;
  metodo: MetodoAsistencia;
  fechaDispositivo: Date;
}) => {
  return prisma.asistencia.create({
    data: {
      ...datos,
      fechaRegistro: new Date(),
    },
  });
};

export const actualizarAsistencia = async (
  id: number,
  datos: Partial<{
    estado: EstadoAsistencia;
    metodo: MetodoAsistencia;
    fechaDispositivo: Date;
  }>,
) => {
  return prisma.asistencia.update({ where: { id }, data: datos });
};

export const eliminarAsistencia = async (id: number) => {
  return prisma.asistencia.delete({ where: { id } });
};

export const registrarAsistenciasEnLote = async (
  datos: {
    claseId: number;
    registros: {
      alumnoId: number;
      estado: EstadoAsistencia;
      metodo: MetodoAsistencia;
      fechaDispositivo: Date;
    }[];
  },
) => {
  return prisma.$transaction(
    datos.registros.map((reg) =>
      prisma.asistencia.create({
        data: {
          claseId: datos.claseId,
          alumnoId: reg.alumnoId,
          estado: reg.estado,
          metodo: reg.metodo,
          fechaDispositivo: reg.fechaDispositivo,
          fechaRegistro: new Date(),
        },
      }),
    ),
  );
};