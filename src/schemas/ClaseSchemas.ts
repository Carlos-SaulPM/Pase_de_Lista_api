import { z } from "zod";

export const crearClaseSchema = z.object({
  materiaId: z.number().int().positive("El ID de la materia debe ser positivo"),
  grupo: z.string().min(1, "El grupo es requerido"),
  periodo: z.string().optional(),
  aula: z.string().optional(),
  profesorId: z.number().int().positive("El ID del profesor debe ser positivo").optional(),
});

export const actualizarClaseSchema = crearClaseSchema.partial();
