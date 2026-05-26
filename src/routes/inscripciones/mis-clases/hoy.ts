import { Response } from "express";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerClasesDeHoy } from "#/services/InscripcionService.js";

/**
 * @openapi
 * /api/inscripciones/mis-clases/hoy:
 *   get:
 *     tags:
 *       - Alumno
 *     summary: Clases del alumno para hoy
 *     description: Incluye enHorario segun la hora actual y tiempoServidor para sincronizacion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clases del dia con estado enHorario
 */
export const GET = [
  authMiddleware,
  async (req: AutenticatedRequest, res: Response) => {
    const resultado = await obtenerClasesDeHoy(req.user.usuarioId);
    res.json(resultado);
  },
];
