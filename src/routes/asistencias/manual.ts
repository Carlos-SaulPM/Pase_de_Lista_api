import { Request, Response } from "express";
import { EstadoAsistencia, MetodoAsistencia } from "@prisma/client";
import { registrarAsistenciasEnLote } from "#/services/AsistenciaService.js";
import { obtenerClasePorId } from "#/services/ClaseService.js";
import { registrarAsistenciaLoteSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

/**
 * @openapi
 * /api/asistencias/manual:
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Registrar asistencia manual en lote
 *     description: Registra múltiples asistencias de forma masiva usando el método MANUAL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - claseId
 *               - registros
 *             properties:
 *               claseId:
 *                 type: integer
 *               registros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - alumnoId
 *                     - estado
 *                   properties:
 *                     alumnoId:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                       enum: [PRESENTE, FALTA, RETARDO, JUSTIFICADO]
 *     responses:
 *       201:
 *         description: Asistencias registradas exitosamente
 *       400:
 *         description: Datos inválidos
 */
export const POST = [
  authMiddleware,
  requireRol("PROFESOR"),
  async (req: AutenticatedRequest, res: Response) => {
    try {
      const validacion = registrarAsistenciaLoteSchema.safeParse(req.body);

      if (!validacion.success) {
        res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
        return;
      }

      const clase = await obtenerClasePorId(validacion.data.claseId);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }

      const registros = validacion.data.registros.map((reg) => ({
        alumnoId: reg.alumnoId,
        estado: reg.estado as EstadoAsistencia,
        metodo: (reg.metodo ?? "MANUAL") as MetodoAsistencia,
        fechaDispositivo: new Date(),
      }));

      const resultado = await registrarAsistenciasEnLote({
        claseId: validacion.data.claseId,
        registros,
      });
      res.status(201).json(resultado);
    } catch (e) {
      if (e instanceof ErrorRecursoNoEncontrado) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("Error al registrar asistencia manual:", e);
      res.status(500).json({ error: "Error interno al registrar asistencias" });
    }
  },
];