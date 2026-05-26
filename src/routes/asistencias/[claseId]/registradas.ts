import { Request, Response } from "express";
import { listarAlumnosConAsistencia } from "#/services/AsistenciaService.js";
import { authMiddleware } from "#/middleware/auth.js";

export const GET = [authMiddleware, async (req: Request, res: Response) => {
  const { claseId } = req.params;

  if (!claseId) {
    res.status(400).json({ error: "Se requiere claseId" });
    return;
  }

  const asistencias = await listarAlumnosConAsistencia(Number(claseId));
  res.json(asistencias);
}];
