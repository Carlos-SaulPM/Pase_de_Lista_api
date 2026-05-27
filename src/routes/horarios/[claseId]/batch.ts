import { Response } from "express";
import { crearHorariosBatch } from "#/services/HorarioService.js";
import { crearHorariosBatchSchema } from "#/schemas/HorarioSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerClasePorId } from "#/services/ClaseService.js";
import { diasDeLaSemana } from "#/util/diasDeLaSemana";
import { DiaDeLaSemana } from "@prisma/client";

export const POST = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const claseId = Number(req.params.claseId);

    if (req.user.rol === "PROFESOR") {
      const clase = await obtenerClasePorId(claseId);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }
    }

    const validacion = crearHorariosBatchSchema.safeParse(req.body);
    if (!validacion.success) {
      res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const datos = validacion.data.map((h) => ({
      claseId,
      dia: h.dia,
      diaDeLaSemana: diasDeLaSemana[h.dia - 1] as DiaDeLaSemana,
      horaDeInicio: new Date(`1970-01-01T${h.horaDeInicio}:00Z`),
      horaDeFin: new Date(`1970-01-01T${h.horaDeFin}:00Z`),
    }));

    await crearHorariosBatch(datos);
    res.status(201).json({ mensaje: "Horarios creados exitosamente" });
  },
];
