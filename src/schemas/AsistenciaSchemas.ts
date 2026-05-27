import { z } from "zod";

export const registrarAsistenciaSchema = z.object({
  claseId: z.number().int().positive("El ID de la clase debe ser positivo"),
  metodo: z.enum(["MANUAL", "BLE", "QR"]),
  fechaDispositivo: z.string().datetime(),
  qrToken: z.string().optional(),
});

const registroAsistenciaSchema = z.object({
  alumnoId: z.number().int().positive(),
  estado: z.enum(["PRESENTE", "FALTA", "RETARDO", "JUSTIFICADO"]),
  totp: z.string().optional(),
  metodo: z.enum(["MANUAL", "BLE", "QR"]).optional(),
});

export const registrarAsistenciaLoteSchema = z.object({
  claseId: z.number().int().positive("El ID de la clase debe ser positivo"),
  registros: z.array(registroAsistenciaSchema),
});

export const actualizarAsistenciaSchema = z.object({
  estado: z.enum(["PRESENTE", "FALTA", "RETARDO", "JUSTIFICADO"]).optional(),
  metodo: z.enum(["MANUAL", "BLE", "QR"]).optional(),
  fechaDispositivo: z.string().datetime().optional(),
});
