import { z } from "zod";

export const loginSchema = z.object({
  matricula: z.string(),
  contrasena: z.string(),
});
