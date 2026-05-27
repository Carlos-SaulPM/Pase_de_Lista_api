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
