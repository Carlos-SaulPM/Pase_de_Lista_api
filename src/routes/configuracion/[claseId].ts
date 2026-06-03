import { Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { actualizarConfiguracionClase } from "#/services/ConfiguracionService.js";

const actualizarConfigSchema = z.object({
  llaveSecreta: z.string().max(120).optional(),
  minutosDeTolerancia: z.number().int().min(0).optional(),
  segundosDeExpiracionDelToken: z.number().int().min(0).optional(),
  distanciaRssi: z.number().int().min(-128).max(0).optional(),
});

/**
 * @openapi
 * /api/configuracion/{claseId}:
 *   put:
 *     tags:
 *       - Profesor
 *     summary: Actualizar configuración BLE de una clase
 *     description: Actualiza parámetros de configuración como llaveSecreta, minutosDeTolerancia, etc.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               llaveSecreta:
 *                 type: string
 *                 maxLength: 120
 *               minutosDeTolerancia:
 *                 type: integer
 *                 minimum: 0
 *               segundosDeExpiracionDelToken:
 *                 type: integer
 *                 minimum: 0
 *               distanciaRssi:
 *                 type: integer
 *                 minimum: -128
 *                 maximum: 0
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Clase no encontrada
 */
export const PUT = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const claseId = Number(req.params.claseId);
    const validacion = actualizarConfigSchema.safeParse(req.body);

    if (!validacion.success) {
      res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    try {
      const resultado = await actualizarConfiguracionClase(
        claseId,
        req.user.rol === "PROFESOR" ? req.user.usuarioId : null,
        validacion.data,
      );
      res.json(resultado);
    } catch (e) {
      if (e instanceof Error) {
        res.status(404).json({ error: e.message });
        return;
      }
      throw e;
    }
  },
];
