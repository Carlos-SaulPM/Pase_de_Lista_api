import {
  listarUsuarios as repoListarUsuarios,
  obtenerUsuarioPorId as repoObtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario as repoActualizarUsuario,
  desactivarUsuario,
} from "#/repositories/UsuarioRepository.js";
import { EncontrarPorMatricula } from "#/repositories/CredencialRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";
import bcrypt from "bcryptjs";

export const listarUsuarios = async () => {
  return repoListarUsuarios();
};

export const crearNuevoUsuario = async (datos: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo?: string;
  rol: "ALUMNO" | "PROFESOR";
  matricula: string;
  contrasena: string;
}) => {
  const existente = await EncontrarPorMatricula(datos.matricula);
  if (existente) {
    throw new ErrorConflicto(`Ya existe un usuario con la matricula "${datos.matricula}"`);
  }
  const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);
  return crearUsuario({ ...datos, contrasena: contrasenaHasheada });
};

export const obtenerUsuarioPorId = async (id: number) => {
  const usuario = await repoObtenerUsuarioPorId(id);
  if (!usuario) {
    throw new ErrorRecursoNoEncontrado("Usuario", id);
  }
  return usuario;
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
  await obtenerUsuarioPorId(id);
  return repoActualizarUsuario(id, datos);
};

export const eliminarUsuario = async (id: number) => {
  await obtenerUsuarioPorId(id);
  return desactivarUsuario(id);
};
