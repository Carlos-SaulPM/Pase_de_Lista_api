import { z } from "zod";
import { registrarAsistenciaSchema, registrarAsistenciaLoteSchema } from "#/schemas/AsistenciaSchemas.js";

export type RegistrarAsistenciaDatos = z.infer<typeof registrarAsistenciaSchema>;
export type RegistrarAsistenciaLoteDatos = z.infer<typeof registrarAsistenciaLoteSchema>;

export interface AsistenciaRespuesta {
  id: number;
  claseId: number;
  alumnoId: number;
  estado: string;
  metodo: string;
  fechaDispositivo: Date;
  fechaRegistro: Date;
  clase: {
    id: number;
    grupo: string;
  };
  alumno: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}
