import { Request, Response } from "express";
import {
  actualizarHorario,
  eliminarHorario,
} from "#/services/HorarioService.js";
import { actualizarHorarioSchema } from "#/schemas/HorarioSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerClasePorId } from "#/services/ClaseService.js";
import { diasDeLaSemana } from "#/util/diasDeLaSemana";
import { DiaDeLaSemana } from "@prisma/client";

/**
 * @openapi
 * /api/horarios/{claseId}/{id}:
 *   put:
 *     tags:
 *       - Profesor
 *     summary: Actualizar horario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dia:
 *                 type: integer
 *               diaDeLaSemana:
 *                 type: string
 *                 enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO]
 *               horaDeInicio:
 *                 type: string
 *               horaDeFin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Horario actualizado
 *       404:
 *         description: Horario no encontrado
 *   delete:
 *     tags:
 *       - Profesor
 *     summary: Eliminar horario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horario eliminado
 *       404:
 *         description: Horario no encontrado
 */
export const PUT = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const claseId = Number(req.params.claseId);
    const id = Number(req.params.id);

    if (req.user.rol === "PROFESOR") {
      const clase = await obtenerClasePorId(claseId);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }
    }

    const validacion = actualizarHorarioSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const datos: Record<string, Date | string | number> = {
      ...validacion.data,
    };

    if (validacion.data.dia !== undefined) {
      datos.diaDeLaSemana = diasDeLaSemana[Number(validacion.data.dia) - 1] as DiaDeLaSemana;
    }

    if (validacion.data.horaDeInicio) {
      datos.horaDeInicio = new Date(
        `1970-01-01T${validacion.data.horaDeInicio}:00Z`,
      );
    }
    if (validacion.data.horaDeFin) {
      datos.horaDeFin = new Date(`1970-01-01T${validacion.data.horaDeFin}:00Z`);
    }

    const resultado = await actualizarHorario(id, datos);
    res.json(resultado);
  },
];

export const DELETE = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const claseId = Number(req.params.claseId);
    const id = Number(req.params.id);

    if (req.user.rol === "PROFESOR") {
      const clase = await obtenerClasePorId(claseId);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }
    }

    await eliminarHorario(id);
    res.json({ mensaje: "Horario eliminado exitosamente" });
  },
];
