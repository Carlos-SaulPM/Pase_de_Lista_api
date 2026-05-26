import { Request, Response } from "express";
import { registrarAsistenciaLoteSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware } from "#/middleware/auth.js";
import { registrarLoteBle } from "#/services/AsistenciaService.js";

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
 *       201:
 *         description: Asistencias registradas
 */
export const POST = [
  authMiddleware,
  async (req: Request, res: Response) => {
    const validacion = registrarAsistenciaLoteSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos invalidos", detalles: validacion.error.errors });
      return;
    }

    const resultado = await registrarLoteBle(
      validacion.data.claseId,
      validacion.data.registros,
    );

    const status = Array.isArray(resultado) ? 201 : 200;
    res.status(status).json(resultado);
  },
];
