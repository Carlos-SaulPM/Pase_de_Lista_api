import { z } from "zod";

const matriculaSchema = z.string().min(1, "La matricula es requerida");

export const crearInscripcionSchema = z
  .object({
    matricula: matriculaSchema.optional(),
    matriculas: z.array(matriculaSchema).optional(),
  })
  .refine(
    (data) => data.matricula || (data.matriculas && data.matriculas.length > 0),
    { message: "Debe proporcionar matricula o matriculas" },
  );
