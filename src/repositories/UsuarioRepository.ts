import prisma from "#/lib/prisma.js";

export const listarUsuarios = async () => {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      correo: true,
      rol: true,
    },
  });
};

export const obtenerUsuarioPorId = async (id: number) => {
  return prisma.usuario.findUnique({
    where: { id },
    include: { credencial: true },
  });
};

export const crearUsuario = async (datos: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo?: string;
  rol: "ALUMNO" | "PROFESOR";
  matricula: string;
  contrasena: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nombre: datos.nombre,
        apellidoPaterno: datos.apellidoPaterno,
        apellidoMaterno: datos.apellidoMaterno,
        correo: datos.correo,
        rol: datos.rol,
        fechaDeCreacion: new Date(),
      },
    });

    const credencial = await tx.credencial.create({
      data: {
        usuarioId: usuario.id,
        matricula: datos.matricula,
        contrasena: datos.contrasena,
        estaActivo: true,
      },
    });

    return { usuario, credencial };
  });
};

export const actualizarUsuario = async (
  id: number,
  datos: Partial<{
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo?: string;
    rol: "ALUMNO" | "PROFESOR";
  }>,
) => {
  return prisma.usuario.update({
    where: { id },
    data: datos,
  });
};

export const desactivarUsuario = async (id: number) => {
  return prisma.credencial.update({
    where: { usuarioId: id },
    data: { estaActivo: false },
  });
};
