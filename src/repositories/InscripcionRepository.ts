import prisma from "#/lib/prisma.js";

export const selectClase = {
  id: true,
  grupo: true,
  periodo: true,
  aula: true,
  materia: {
    select: { nombre: true },
  },
  profesor: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
  },
  configuracion: {
    select: { llaveSecreta: true },
  },
  horarios: {
    select: {
      dia: true,
      diaDeLaSemana: true,
      horaDeInicio: true,
      horaDeFin: true,
    },
  },
} as const;

export const listarInscripcionesPorClase = async (claseId: number) => {
  return prisma.inscripcion.findMany({
    where: { claseId, estaActivo: true },
    select: {
      alumnoId: true,
      alumno: {
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          credencial: {
            select: { matricula: true },
          },
        },
      },
    },
  });
};

export const obtenerInscripcionPorId = async (id: number) => {
  return prisma.inscripcion.findUnique({
    where: { id },
    include: { alumno: true, clase: true },
  });
};

export const obtenerInscripcionActiva = async (claseId: number, alumnoId: number) => {
  return prisma.inscripcion.findFirst({
    where: { claseId, alumnoId, estaActivo: true, fechaDeBaja: null },
  });
};

export const crearInscripcion = async (datos: {
  claseId: number;
  alumnoId: number;
}) => {
  return prisma.inscripcion.create({
    data: {
      claseId: datos.claseId,
      alumnoId: datos.alumnoId,
      fechaDeCreacion: new Date(),
      estaActivo: true,
    },
    include: { alumno: true, clase: true },
  });
};

export const eliminarInscripcion = async (id: number) => {
  return prisma.inscripcion.update({
    where: { id },
    data: { estaActivo: false, fechaDeBaja: new Date() },
  });
};

export const obtenerInscripcionesPorAlumno = async (alumnoId: number) => {
  return prisma.inscripcion.findMany({
    where: {
      alumnoId,
      estaActivo: true,
      fechaDeBaja: null,
    },
    select: { clase: { select: selectClase } },
    orderBy: { fechaDeCreacion: "desc" },
  });
};

export const obtenerInscripcionesDeHoy = async (alumnoId: number, diaSemana: number) => {
  return prisma.inscripcion.findMany({
    where: {
      alumnoId,
      estaActivo: true,
      fechaDeBaja: null,
      clase: {
        horarios: {
          some: { dia: diaSemana },
        },
      },
    },
    select: {
      clase: {
        select: selectClase,
      },
    },
    orderBy: { fechaDeCreacion: "desc" },
  });
};
