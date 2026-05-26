import prisma from "#/lib/prisma.js";

export const listarMaterias = async () => {
  return prisma.materia.findMany();
};

export const obtenerMateriaPorId = async (id: number) => {
  return prisma.materia.findUnique({ where: { id } });
};

export const crearMateria = async (datos: { clave: string; nombre: string }) => {
  return prisma.materia.create({ data: datos });
};

export const actualizarMateria = async (
  id: number,
  datos: Partial<{ clave: string; nombre: string }>,
) => {
  return prisma.materia.update({ where: { id }, data: datos });
};

export const eliminarMateria = async (id: number) => {
  return prisma.materia.delete({ where: { id } });
};
