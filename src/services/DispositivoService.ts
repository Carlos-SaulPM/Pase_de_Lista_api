import {
  obtenerDispositivosPorUsuario as repoObtenerDispositivosPorUsuario,
  obtenerDispositivoPorAndroidId,
  registrarDispositivo,
  actualizarDispositivo as repoActualizarDispositivo,
  eliminarDispositivo as repoEliminarDispositivo,
} from "#/repositories/DispositivoRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

export const obtenerDispositivosPorUsuario = async (usuarioId: number) => {
  const dispositivos = await repoObtenerDispositivosPorUsuario(usuarioId);
  if (dispositivos.length === 0) {
    throw new ErrorRecursoNoEncontrado("Dispositivos", usuarioId);
  }
  return dispositivos;
};

export const registrarNuevoDispositivo = async (datos: {
  usuarioId: number;
  androidId: string;
  fcmToken: string;
}) => {
  return registrarDispositivo(datos);
};

export const actualizarDispositivo = async (
  id: number,
  datos: Partial<{ androidId: string; fcmToken: string }>,
) => {
  return repoActualizarDispositivo(id, datos);
};

export const eliminarDispositivo = async (id: number) => {
  return repoEliminarDispositivo(id);
};

export const registrarOActualizarDispositivo = async (datos: {
  usuarioId: number;
  androidId: string;
  fcmToken: string;
}) => {
  const existente = await obtenerDispositivoPorAndroidId(datos.androidId);

  if (existente) {
    return {
      resultado: await repoActualizarDispositivo(existente.id, { fcmToken: datos.fcmToken }),
      esNuevo: false,
    };
  }

  return {
    resultado: await registrarDispositivo(datos),
    esNuevo: true,
  };
};


