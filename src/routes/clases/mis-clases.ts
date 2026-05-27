import { Response } from "express";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerMisClases } from "#/services/ClaseService.js";

function fmt(t: Date): string {
  const d = t instanceof Date ? t : new Date(t);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function fmtHorarios(h: { dia: number; diaDeLaSemana: string; horaDeInicio: Date; horaDeFin: Date }) {
  return {
    dia: h.dia,
    diaDeLaSemana: h.diaDeLaSemana,
    horaDeInicio: fmt(h.horaDeInicio),
    horaDeFin: fmt(h.horaDeFin),
  };
}

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
  requireRol("PROFESOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const clases = await obtenerMisClases(req.user.usuarioId);
    res.json(clases.map((c) => ({ ...c, horarios: c.horarios?.map(fmtHorarios) ?? [] })));
  },
];
