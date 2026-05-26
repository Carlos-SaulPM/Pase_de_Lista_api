import { Rol } from "@prisma/client";
import { z } from "zod";
import { crearUsuarioSchema, actualizarUsuarioSchema } from "#/schemas/UsuarioSchemas.js";

export type CrearUsuarioDatos = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioDatos = z.infer<typeof actualizarUsuarioSchema>;

export interface UsuarioRespuesta {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string | null;
  rol: Rol;
}

export interface UsuarioConCredencial {
  usuario: UsuarioRespuesta & { fechaDeCreacion: Date };
  credencial: {
    id: number;
    matricula: string;
    estaActivo: boolean;
  };
}
