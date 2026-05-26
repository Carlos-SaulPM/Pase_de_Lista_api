import {
  listarMaterias as repoListarMaterias,
  obtenerMateriaPorId as repoObtenerMateriaPorId,
  crearMateria,
  actualizarMateria as repoActualizarMateria,
  eliminarMateria as repoEliminarMateria,
} from "#/repositories/MateriaRepository.js";
import { Prisma } from "@prisma/client";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

export const listarMaterias = async () => {
  return repoListarMaterias();
};

export const crearNuevaMateria = async (datos: { clave: string; nombre: string }) => {
  try {
    return await crearMateria(datos);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new ErrorConflicto(`Ya existe una materia con la clave "${datos.clave}"`);
    }
    throw e;
  }
};

export const obtenerMateriaPorId = async (id: number) => {
  const materia = await repoObtenerMateriaPorId(id);
  if (!materia) {
    throw new ErrorRecursoNoEncontrado("Materia", id);
  }
  return materia;
};

export const actualizarMateria = async (
  id: number,
  datos: Partial<{ clave: string; nombre: string }>,
) => {
  await obtenerMateriaPorId(id);
  return repoActualizarMateria(id, datos);
};

export const eliminarMateria = async (id: number) => {
  await obtenerMateriaPorId(id);
  return repoEliminarMateria(id);
};
