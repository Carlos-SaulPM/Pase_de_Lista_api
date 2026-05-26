import { Request, Response } from "express";
import { actualizarAsistencia, eliminarAsistencia } from "#/services/AsistenciaService.js";
import { actualizarAsistenciaSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/asistencias/{id}:
 *   put:
 *     tags:
 *       - Profesor
 *     summary: Actualizar asistencia
 *     description: Corrige el estado o método de una asistencia registrada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
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
 *               estado:
 *                 type: string
 *                 enum: [PRESENTE, FALTA, RETARDO, JUSTIFICADO]
 *               metodo:
 *                 type: string
 *                 enum: [MANUAL, BLE, QR]
 *               fechaDispositivo:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Asistencia actualizada
 *       404:
 *         description: Asistencia no encontrada
 *   delete:
 *     tags:
 *       - Profesor
 *     summary: Eliminar asistencia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asistencia eliminada
 *       404:
 *         description: Asistencia no encontrada
 */
export const PUT = [authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const validacion = actualizarAsistenciaSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
    return;
  }

  const datos: Record<string, Date | string> = { ...validacion.data };
  if (validacion.data.fechaDispositivo) {
    datos.fechaDispositivo = new Date(validacion.data.fechaDispositivo);
  }

  const resultado = await actualizarAsistencia(id, datos);
  res.json(resultado);
}];

export const DELETE = [authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await eliminarAsistencia(id);
  res.json({ mensaje: "Asistencia eliminada exitosamente" });
}];
