import { Response } from "express";
import { obtenerPerfil } from "#/services/AutenticacionService.js";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/auth/perfil:
 *   get:
 *     tags:
 *       - Autenticacion
 *     summary: Obtener perfil del usuario autenticado
 *     description: Devuelve los datos del perfil del usuario autenticado usando el token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilResponse'
 *       401:
 *         description: No autenticado o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export const GET = [
  authMiddleware,
  async (req: AutenticatedRequest, res: Response) => {
    try {
      const perfil = await obtenerPerfil(req.user);
      res.json(perfil);
    } catch (error) {
      console.error("Error en perfil:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
];
