import { Response } from "express";
import {
  listarHorariosPorClase,
  crearNuevoHorario,
} from "#/services/HorarioService.js";
import { crearHorarioSchema } from "#/schemas/HorarioSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { obtenerClasePorId } from "#/services/ClaseService.js";
import { diasDeLaSemana } from "#/util/diasDeLaSemana";
import { DiaDeLaSemana } from "@prisma/client";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";

function fmt(t: Date): string {
  return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
}

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

    const horarios = (await listarHorariosPorClase(claseId)).map((h) => ({
      id: h.id,
      claseId: h.claseId,
      dia: h.dia,
      diaDeLaSemana: h.diaDeLaSemana,
      horaDeInicio: fmt(h.horaDeInicio),
      horaDeFin: fmt(h.horaDeFin),
    }));
    res.json(horarios);
  },
];

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
