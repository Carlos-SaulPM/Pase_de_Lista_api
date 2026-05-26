import { DiaDeLaSemana } from "@prisma/client";
import {
  listarHorariosPorClase as repoListarHorariosPorClase,
  obtenerHorarioPorId as repoObtenerHorarioPorId,
  obtenerHorarioDeHoy,
  crearHorario,
  actualizarHorario as repoActualizarHorario,
  eliminarHorario as repoEliminarHorario,
} from "#/repositories/HorarioRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";

export const listarHorariosPorClase = async (claseId: number) => {
  return repoListarHorariosPorClase(claseId);
};

export const crearNuevoHorario = async (datos: {
  claseId: number;
  dia: number;
  diaDeLaSemana: DiaDeLaSemana;
  horaDeInicio: Date;
  horaDeFin: Date;
}) => {
  const existente = await obtenerHorarioDeHoy(datos.claseId, datos.dia);
  if (existente) {
    throw new ErrorConflicto("Ya existe un horario para este dia en esta clase");
  }
  return crearHorario(datos);
};

export const obtenerHorarioPorId = async (id: number) => {
  const horario = await repoObtenerHorarioPorId(id);
  if (!horario) {
    throw new ErrorRecursoNoEncontrado("Horario", id);
  }
  return horario;
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
  await obtenerHorarioPorId(id);
  return repoActualizarHorario(id, datos);
};

export const eliminarHorario = async (id: number) => {
  await obtenerHorarioPorId(id);
  return repoEliminarHorario(id);
};
