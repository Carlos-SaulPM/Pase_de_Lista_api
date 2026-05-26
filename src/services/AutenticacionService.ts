import bcrypt from "bcryptjs";
import { crearToken } from "#/lib/jwt.js";
import { EncontrarPorMatricula } from "#/repositories/CredencialRepository.js";
import { LoginRequest, TokenPayload } from "#/types/AutenticacionTypes.js";
import { ErrorAutenticacion } from "#/errors/ErrorAutenticacion.js";

export { ErrorAutenticacion };

export const iniciarSesion = async (data: LoginRequest) => {
  const credencial = await EncontrarPorMatricula(data.matricula);

  if (!credencial || !credencial.estaActivo) {
    throw new ErrorAutenticacion("Credenciales inválidas");
  }

  const contrasenaValida = await bcrypt.compare(
    data.contrasena,
    credencial.contrasena,
  );

  if (!contrasenaValida) {
    throw new ErrorAutenticacion("Credenciales inválidas");
  }

  const token = crearToken({
    usuarioId: credencial.usuario.id,
    matricula: credencial.matricula,
    nombre: credencial.usuario.nombre,
    rol: credencial.usuario.rol,
  });

  return { token };
};

export const obtenerPerfil = async (payload: TokenPayload) => {
  const credencial = await EncontrarPorMatricula(payload.matricula);

  if (!credencial || !credencial.estaActivo) {
    throw new ErrorAutenticacion("Usuario no encontrado");
  }

  return {
    id: credencial.usuario.id,
    nombre: credencial.usuario.nombre,
    correo: credencial.usuario.correo,
    rol: credencial.usuario.rol,
    matricula: credencial.matricula,
  };
};
