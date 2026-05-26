import { z } from "zod";
import { crearHorarioSchema } from "#/schemas/HorarioSchemas.js";

export type CrearHorarioDatos = z.infer<typeof crearHorarioSchema>;

export interface HorarioRespuesta {
  id: number;
  claseId: number;
  dia: number;
  diaDeLaSemana: string;
  horaDeInicio: Date;
  horaDeFin: Date;
}
