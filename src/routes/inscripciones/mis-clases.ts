import { Response } from "express";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerMisClases } from "#/services/InscripcionService.js";

/**
 * @openapi
 * /api/inscripciones/mis-clases:
 *   get:
 *     tags:
 *       - Alumno
 *     summary: Clases del alumno autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscripciones del alumno
 */
export const GET = [
  authMiddleware,
  requireRol("ALUMNO"),
  async (req: AutenticatedRequest, res: Response) => {
    const inscripciones = await obtenerMisClases(req.user.usuarioId);
    res.json(inscripciones);
  },
];
