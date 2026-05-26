import { z } from "zod";

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
  correo: z.string().email().optional().or(z.literal("")),
  rol: z.enum(["ALUMNO", "PROFESOR"]),
  matricula: z.string().min(1, "La matrícula es requerida"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellidoPaterno: z.string().min(1).optional(),
  apellidoMaterno: z.string().min(1).optional(),
  correo: z.string().email().optional().or(z.literal("")),
  rol: z.enum(["ALUMNO", "PROFESOR"]).optional(),
});
