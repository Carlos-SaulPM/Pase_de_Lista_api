import { Request, Response } from "express";
import {
  actualizarHorario,
  eliminarHorario,
} from "#/services/HorarioService.js";
import { actualizarHorarioSchema } from "#/schemas/HorarioSchemas.js";
import { authMiddleware } from "#/middleware/auth.js";

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
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
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
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await eliminarHorario(id);
    res.json({ mensaje: "Horario eliminado exitosamente" });
  },
];
