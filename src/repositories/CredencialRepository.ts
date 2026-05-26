import prisma from "#/lib/prisma.js";

export const EncontrarPorMatricula = async (matricula: string) => {
  return prisma.credencial.findUnique({
    where: { matricula },
    include: {
      usuario: true,
    },
  });
};
