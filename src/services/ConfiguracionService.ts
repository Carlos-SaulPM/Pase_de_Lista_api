import { obtenerClasePorId } from "#/repositories/ClaseRepository.js";
import { actualizarConfiguracion } from "#/repositories/ConfiguracionRepository.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

export const actualizarConfiguracionClase = async (
  claseId: number,
  profesorId: number | null,
  datos: {
    llaveSecreta?: string;
    minutosDeTolerancia?: number;
    segundosDeExpiracionDelToken?: number;
    distanciaRssi?: number;
  },
) => {
  const clase = await obtenerClasePorId(claseId);
  if (!clase) {
    throw new ErrorRecursoNoEncontrado("Clase", claseId);
  }

  if (profesorId !== null && clase.profesorId !== profesorId) {
    throw new ErrorRecursoNoEncontrado("Clase", claseId);
  }

  return actualizarConfiguracion(claseId, datos);
};
