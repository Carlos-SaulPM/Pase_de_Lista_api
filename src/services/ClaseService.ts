import {
  listarClases as repoListarClases,
  obtenerClasePorId as repoObtenerClasePorId,
  crearClase,
  actualizarClase as repoActualizarClase,
  desactivarClase as repoDesactivarClase,
  obtenerClasesPorProfesor as repoObtenerClasesPorProfesor,
  obtenerClasePorGrupo,
} from "#/repositories/ClaseRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";

export const listarClases = async () => {
  return repoListarClases();
};

export const obtenerClasePorId = async (id: number) => {
  const clase = await repoObtenerClasePorId(id);
  if (!clase) {
    throw new ErrorRecursoNoEncontrado("Clase", id);
  }
  return clase;
};

export const crearNuevaClase = async (datos: {
  materiaId: number;
  grupo: string;
  periodo?: string;
  profesorId: number;
}) => {
  const existente = await obtenerClasePorGrupo(datos.grupo);
  if (existente) {
    throw new ErrorConflicto(`Ya existe una clase con el grupo "${datos.grupo}"`);
  }
  return crearClase(datos);
};

export const actualizarClase = async (
  id: number,
  datos: Partial<{
    materiaId: number;
    profesorId: number;
    grupo: string;
    periodo: string;
    estaActivo: boolean;
  }>,
) => {
  await obtenerClasePorId(id);
  return repoActualizarClase(id, datos);
};

export const desactivarClase = async (id: number) => {
  await obtenerClasePorId(id);
  return repoDesactivarClase(id);
};

export const obtenerMisClases = async (profesorId: number) => {
  return repoObtenerClasesPorProfesor(profesorId);
};