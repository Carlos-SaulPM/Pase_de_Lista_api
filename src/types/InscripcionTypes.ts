import { z } from "zod";
import { crearInscripcionSchema } from "#/schemas/InscripcionSchemas.js";

export type CrearInscripcionDatos = z.infer<typeof crearInscripcionSchema>;

export interface InscripcionRespuesta {
  id: number;
  claseId: number;
  alumnoId: number;
  estaActivo: boolean;
  fechaDeCreacion: Date;
  alumno: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}
