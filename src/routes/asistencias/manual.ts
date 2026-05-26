import { Request, Response } from "express";
import { EstadoAsistencia, MetodoAsistencia } from "@prisma/client";
import { registrarAsistenciasEnLote } from "#/services/AsistenciaService.js";
import { registrarAsistenciaLoteSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware } from "#/middleware/auth.js";

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
export const POST = [authMiddleware, async (req: Request, res: Response) => {
  const validacion = registrarAsistenciaLoteSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
    return;
  }

  const registros = validacion.data.registros.map((reg) => ({
    alumnoId: reg.alumnoId,
    estado: reg.estado as EstadoAsistencia,
    metodo: "MANUAL" as MetodoAsistencia,
    fechaDispositivo: new Date(),
  }));

  const resultado = await registrarAsistenciasEnLote({
    claseId: validacion.data.claseId,
    registros,
  });
  res.status(201).json(resultado);
}];
