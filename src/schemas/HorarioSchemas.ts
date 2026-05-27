import { z } from "zod";

export const crearHorarioSchema = z.object({
  dia: z.number().int().min(1).max(6, "El día debe estar entre 0 y 6"),
  horaDeInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),
  horaDeFin: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),
});

export const crearHorariosBatchSchema = z.array(crearHorarioSchema).min(1, "Debe incluir al menos un horario");

export const actualizarHorarioSchema = crearHorarioSchema.partial();
