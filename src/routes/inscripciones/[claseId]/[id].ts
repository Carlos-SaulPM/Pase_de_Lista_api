import { Request, Response } from "express";
import { eliminarInscripcion } from "#/services/InscripcionService.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/inscripciones/{claseId}/{id}:
 *   delete:
 *     tags:
 *       - Profesor
 *     summary: Dar de baja inscripción
 *     description: Eliminación lógica de la inscripción del alumno
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inscripción dada de baja
 *       404:
 *         description: Inscripción no encontrada
 */
export const DELETE = [authMiddleware, requireRol("PROFESOR", "ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await eliminarInscripcion(id);
  res.json({ mensaje: "Inscripción dada de baja exitosamente" });
}];
