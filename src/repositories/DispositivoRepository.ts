import prisma from "#/lib/prisma.js";

export const obtenerDispositivosPorUsuario = async (usuarioId: number) => {
  return prisma.dispositivos.findMany({
    where: { usuarioId },
    include: { usuario: true },
  });
};

export const obtenerDispositivoPorAndroidId = async (androidId: string) => {
  return prisma.dispositivos.findUnique({
    where: { androidId },
  });
};

export const registrarDispositivo = async (datos: {
  usuarioId: number;
  androidId: string;
  fcmToken: string;
}) => {
  return prisma.dispositivos.create({
    data: datos,
    include: { usuario: true },
  });
};

export const actualizarDispositivo = async (
  id: number,
  datos: Partial<{ androidId: string; fcmToken: string }>,
) => {
  return prisma.dispositivos.update({
    where: { id },
    data: datos,
  });
};

export const eliminarDispositivo = async (id: number) => {
  return prisma.dispositivos.delete({ where: { id } });
};
