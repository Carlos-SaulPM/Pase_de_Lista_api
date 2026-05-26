import { z } from "zod";

export const crearInscripcionSchema = z.object({
  matricula: z.string().min(1, "La matricula es requerida"),
});
