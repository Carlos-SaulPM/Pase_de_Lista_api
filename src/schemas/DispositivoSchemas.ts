import { z } from "zod";

export const registrarDispositivoSchema = z.object({
  androidId: z.string().min(1, "El Android ID es requerido"),
  fcmToken: z.string().min(1, "El FCM Token es requerido"),
});

export const actualizarDispositivoSchema = registrarDispositivoSchema.partial();
