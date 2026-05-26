import { z } from "zod";

export const crearMateriaSchema = z.object({
  clave: z.string().min(1, "La clave es requerida"),
  nombre: z.string().min(1, "El nombre es requerido"),
});

export const actualizarMateriaSchema = crearMateriaSchema.partial();
