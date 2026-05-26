import { z } from "zod";
import { crearClaseSchema } from "#/schemas/ClaseSchemas.js";

export type CrearClaseDatos = z.infer<typeof crearClaseSchema>;

export interface ClaseRespuesta {
  id: number;
  materiaId: number;
  profesorId: number;
  grupo: string;
  periodo: string | null;
  estaActivo: boolean;
  fechaDeCreacion: Date;
  materia: {
    id: number;
    clave: string;
    nombre: string;
  };
  profesor: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}
