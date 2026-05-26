import { z } from "zod";
import { crearMateriaSchema } from "#/schemas/MateriaSchemas.js";

export type CrearMateriaDatos = z.infer<typeof crearMateriaSchema>;

export interface MateriaRespuesta {
  id: number;
  clave: string;
  nombre: string;
}
