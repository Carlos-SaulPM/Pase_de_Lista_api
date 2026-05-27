import { Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { iniciarSesion } from "#/services/AsistenciaService.js";
import { ErrorValidacion } from "#/errors/ErrorValidacion.js";

const iniciarSesionSchema = z.object({
  claseId: z.number().int().positive(),
  metodo: z.enum(["BLE", "QR", "MANUAL"]).default("BLE"),
});

/**
 * @openapi
 * /api/asistencias/iniciar:
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Iniciar sesion de asistencia
 *     description: Notifica a los alumnos via FCM, genera QR token e incluye llaveSecreta para BLE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - claseId
 *             properties:
 *               claseId:
 *                 type: integer
 *               metodo:
 *                 type: string
 *                 enum: [BLE, QR, MANUAL]
 *                 default: BLE
 *     responses:
 *       200:
 *         description: Sesion iniciada
 *       403:
 *         description: No eres el profesor de esta clase
 */
export const POST = [authMiddleware, requireRol("PROFESOR"), async (req: AutenticatedRequest, res: Response) => {
  const validacion = iniciarSesionSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const { claseId, metodo } = validacion.data;

  try {
    const resultado = await iniciarSesion(claseId, metodo, req.user.usuarioId);
    res.json(resultado);
  } catch (e) {
    if (e instanceof ErrorValidacion) {
      res.status(403).json({ error: e.message });
      return;
    }
    console.error("Error al iniciar sesion de asistencia:", e);
    res.status(500).json({ error: "Error interno al iniciar sesion" });
  }
}];
