import { Request, Response } from "express";
import { listarAlumnosConAsistencia } from "#/services/AsistenciaService.js";
import { authMiddleware } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/asistencias/{claseId}/registradas:
 *   get:
 *     tags:
 *       - Profesor
 *     summary: Listar alumnos con asistencia registrada
 *     description: Obtiene los alumnos que ya registraron asistencia para una clase, incluyendo estado y método
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asistencias registradas para la clase
 *       400:
 *         description: Se requiere claseId
 */
export const GET = [authMiddleware, async (req: Request, res: Response) => {
  const { claseId } = req.params;

  if (!claseId) {
    res.status(400).json({ error: "Se requiere claseId" });
    return;
  }

  const asistencias = await listarAlumnosConAsistencia(Number(claseId));
  res.json(asistencias);
}];
