import { Request, Response } from "express";
import {
  listarHorariosPorClase,
  crearNuevoHorario,
} from "#/services/HorarioService.js";
import { crearHorarioSchema } from "#/schemas/HorarioSchemas.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";
import { diasDeLaSemana } from "#/util/diasDeLaSemana";
import { DiaDeLaSemana } from "@prisma/client";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";

/**
 * @openapi
 * /api/horarios/{claseId}:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Listar horarios de una clase
 *     description: Obtiene todos los horarios configurados para una clase específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de horarios de la clase
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   claseId:
 *                     type: integer
 *                   dia:
 *                     type: integer
 *                   diaDeLaSemana:
 *                     type: string
 *                   horaDeInicio:
 *                     type: string
 *                   horaDeFin:
 *                     type: string
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Crear horario para una clase
 *     description: Crea un nuevo horario. El diaDeLaSemana se calcula automáticamente del campo dia.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
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
 *             required:
 *               - dia
 *               - horaDeInicio
 *               - horaDeFin
 *             properties:
 *               dia:
 *                 type: integer
 *                 description: Día de la semana (1=Lunes, 6=Sábado)
 *               horaDeInicio:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               horaDeFin:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
export const GET = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: Request, res: Response) => {
    const claseId = Number(req.params.claseId);
    const horarios = await listarHorariosPorClase(claseId);
    res.json(horarios);
  },
];

export const POST = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: Request, res: Response) => {
    const claseId = Number(req.params.claseId);
    const validacion = crearHorarioSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const diaDeLaSemana = diasDeLaSemana[Number(req.body.dia) - 1];

    const horaInicio = new Date(
      `1970-01-01T${validacion.data.horaDeInicio}:00Z`,
    );
    const horaFin = new Date(`1970-01-01T${validacion.data.horaDeFin}:00Z`);

    try {
      const resultado = await crearNuevoHorario({
        claseId,
        dia: validacion.data.dia,
        diaDeLaSemana: diaDeLaSemana as DiaDeLaSemana,
        horaDeInicio: horaInicio,
        horaDeFin: horaFin,
      });

      const respuesta = {
        ...resultado,
        horaDeInicio: `${resultado.horaDeInicio.getUTCHours()}:${resultado.horaDeInicio.getUTCMinutes()}`,
        horaDeFin: `${resultado.horaDeFin.getUTCHours()}:${resultado.horaDeFin.getUTCMinutes() === 0 ? "00" : resultado.horaDeFin.getUTCMinutes()}`,
      };
      res.status(201).json(respuesta);
    } catch (e) {
      if (e instanceof ErrorConflicto) {
        res.status(409).json({ error: e.message });
        return;
      }
      throw e;
    }
  },
];
