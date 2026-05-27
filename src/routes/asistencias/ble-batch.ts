import { Request, Response } from "express";
import { registrarAsistenciaLoteSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { registrarLoteBle } from "#/services/AsistenciaService.js";
import { obtenerClasePorId } from "#/services/ClaseService.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";

/**
 * @openapi
 * /api/asistencias/ble-batch:
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Registrar asistencias por lote BLE
 *     description: Valida TOTP de cada alumno y registra en lote. Omite duplicados.
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
 *                   properties:
 *                     alumnoId:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                       enum: [PRESENTE, FALTA, RETARDO, JUSTIFICADO]
 *                     totp:
 *                       type: string
 *     responses:
 *       200:
 *         description: Asistencias registradas
 */
export const POST = [
  authMiddleware,
  requireRol("PROFESOR"),
  async (req: AutenticatedRequest, res: Response) => {
    try {
      const validacion = registrarAsistenciaLoteSchema.safeParse(req.body);

      if (!validacion.success) {
        res
          .status(400)
          .json({ error: "Datos invalidos", detalles: validacion.error.errors });
        return;
      }

      const clase = await obtenerClasePorId(validacion.data.claseId);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }

      const resultado = await registrarLoteBle(
        validacion.data.claseId,
        validacion.data.registros,
      );

      res.json(resultado);
    } catch (e) {
      if (e instanceof ErrorRecursoNoEncontrado) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("Error al registrar lote BLE:", e);
      res.status(500).json({ error: "Error interno al registrar asistencias" });
    }
  },
];