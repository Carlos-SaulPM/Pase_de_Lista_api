import { Response } from "express";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";
import { registrarOActualizarDispositivo } from "#/services/DispositivoService.js";
import { registrarDispositivoSchema } from "#/schemas/DispositivoSchemas.js";

/**
 * @openapi
 * /api/dispositivos/fcm:
 *   post:
 *     tags:
 *       - Alumno
 *     summary: Registrar o actualizar token FCM
 *     description: Verifica si el alumno ya tiene dispositivo y lo actualiza, o crea uno nuevo
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
 *         description: Token registrado
 *       200:
 *         description: Token actualizado
 */
export const POST = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const validacion = registrarDispositivoSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const { androidId, fcmToken } = validacion.data;
  const usuarioId = req.user.usuarioId;

  const { resultado, esNuevo } = await registrarOActualizarDispositivo({ usuarioId, androidId, fcmToken });
  res.status(esNuevo ? 201 : 200).json(resultado);
}];
