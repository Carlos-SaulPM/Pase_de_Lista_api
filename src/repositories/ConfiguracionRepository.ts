import prisma from "#/lib/prisma.js";

export const actualizarConfiguracion = async (
  claseId: number,
  datos: {
    llaveSecreta?: string;
    minutosDeTolerancia?: number;
    segundosDeExpiracionDelToken?: number;
    distanciaRssi?: number;
  },
) => {
  return prisma.configuracionDeClase.upsert({
    where: { claseId },
    create: {
      claseId,
      llaveSecreta: datos.llaveSecreta ?? null,
      minutosDeTolerancia: datos.minutosDeTolerancia ?? null,
      segundosDeExpiracionDelToken: datos.segundosDeExpiracionDelToken ?? null,
      distanciaRssi: datos.distanciaRssi ?? null,
    },
    update: {
      ...(datos.llaveSecreta !== undefined && { llaveSecreta: datos.llaveSecreta }),
      ...(datos.minutosDeTolerancia !== undefined && { minutosDeTolerancia: datos.minutosDeTolerancia }),
      ...(datos.segundosDeExpiracionDelToken !== undefined && { segundosDeExpiracionDelToken: datos.segundosDeExpiracionDelToken }),
      ...(datos.distanciaRssi !== undefined && { distanciaRssi: datos.distanciaRssi }),
    },
  });
};
