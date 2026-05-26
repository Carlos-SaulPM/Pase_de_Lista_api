import { Response } from "express";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerMisClases } from "#/services/ClaseService.js";

/**
 * @openapi
 * /api/clases/mis-clases:
 *   get:
 *     tags:
 *       - Profesor
 *     summary: Clases del profesor autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clases del profesor
 */
export const GET = [
  authMiddleware,
  async (req: AutenticatedRequest, res: Response) => {
    const clases = await obtenerMisClases(req.user.usuarioId);
    res.json(clases);
  },
];
