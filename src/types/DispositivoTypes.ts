import { z } from "zod";
import { registrarDispositivoSchema } from "#/schemas/DispositivoSchemas.js";

export type RegistrarDispositivoDatos = z.infer<typeof registrarDispositivoSchema>;

export interface DispositivoRespuesta {
  usuarioId: number;
  androidId: string;
  fcmToken: string;
  usuario: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}
