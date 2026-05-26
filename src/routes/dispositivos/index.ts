import { Response } from "express";
import { registrarOActualizarDispositivo } from "#/services/DispositivoService.js";
import { registrarDispositivoSchema } from "#/schemas/DispositivoSchemas.js";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/dispositivos:
 *   post:
 *     tags:
 *       - Alumno
 *     summary: Registrar dispositivo
 *     description: Registra o actualiza el dispositivo del alumno para FCM
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - androidId
 *               - fcmToken
 *             properties:
 *               androidId:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispositivo registrado
 *       200:
 *         description: Dispositivo actualizado
 */
export const POST = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const validacion = registrarDispositivoSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const { resultado, esNuevo } = await registrarOActualizarDispositivo({ usuarioId: req.user.usuarioId, ...validacion.data });
  res.status(esNuevo ? 201 : 200).json(resultado);
}];
