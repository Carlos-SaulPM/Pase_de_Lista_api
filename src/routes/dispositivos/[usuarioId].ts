import { Request, Response } from "express";
import { obtenerDispositivosPorUsuario, actualizarDispositivo, eliminarDispositivo } from "#/services/DispositivoService.js";
import { actualizarDispositivoSchema } from "#/schemas/DispositivoSchemas.js";
import { authMiddleware, AutenticatedRequest } from "#/middleware/auth.js";

export const GET = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const usuarioId = Number(req.params.usuarioId);
  const dispositivos = await obtenerDispositivosPorUsuario(usuarioId);
  res.json(dispositivos);
}];

export const PUT = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const id = Number(req.body.id);
  if (!id) {
    res.status(400).json({ error: "Se requiere el id del dispositivo" });
    return;
  }
  const validacion = actualizarDispositivoSchema.safeParse(req.body);
  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }
  const resultado = await actualizarDispositivo(id, validacion.data);
  res.json(resultado);
}];

export const DELETE = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const id = Number(req.body.id || req.query.id);
  if (!id) {
    res.status(400).json({ error: "Se requiere el id del dispositivo" });
    return;
  }
  await eliminarDispositivo(id);
  res.json({ mensaje: "Dispositivo eliminado exitosamente" });
}];
