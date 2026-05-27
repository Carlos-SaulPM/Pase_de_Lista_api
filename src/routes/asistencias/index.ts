import { Request, Response } from "express";
import { listarAsistencias, listarAlumnosConAsistencia, registrarAsistenciaQR } from "#/services/AsistenciaService.js";
import { registrarAsistenciaSchema } from "#/schemas/AsistenciaSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";
import { ErrorValidacion } from "#/errors/ErrorValidacion.js";

/**
 * @openapi
 * /api/asistencias:
 *   get:
 *     tags:
 *       - Profesor
 *     summary: Listar asistencias
 *     description: Filtra por claseId o alumnoId via query params
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: claseId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: alumnoId
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asistencias
 *   post:
 *     tags:
 *       - Alumno
 *     summary: Registrar asistencia por QR
 *     description: El alumno escanea el QR del profesor y envia el qrToken
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
 *               - metodo
 *               - fechaDispositivo
 *               - qrToken
 *             properties:
 *               claseId:
 *                 type: integer
 *               metodo:
 *                 type: string
 *                 enum: [MANUAL, BLE, QR]
 *               fechaDispositivo:
 *                 type: string
 *                 format: date-time
 *               qrToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asistencia registrada
 *       400:
 *         description: QR invalido o expirado
 */
export const GET = [authMiddleware, async (req: Request, res: Response) => {
  const claseId = req.query.claseId ? Number(req.query.claseId) : undefined;
  const alumnoId = req.query.alumnoId ? Number(req.query.alumnoId) : undefined;

  const asistencias = await listarAsistencias({ claseId, alumnoId });
  res.json(asistencias);
}];

export const GET_REGISTRADAS = [authMiddleware, async (req: Request, res: Response) => {
  const { claseId } = req.params;

  if (!claseId) {
    res.status(400).json({ error: "Se requiere claseId" });
    return;
  }

  const asistencias = await listarAlumnosConAsistencia(Number(claseId));
  res.json(asistencias);
}];

export const POST = [authMiddleware, async (req: AutenticatedRequest, res: Response) => {
  const validacion = registrarAsistenciaSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const { claseId, metodo, fechaDispositivo, qrToken } = validacion.data;

  if (metodo !== "QR" || !qrToken) {
    res.status(400).json({ error: "Se requiere qrToken para metodo QR" });
    return;
  }

  try {
    const { asistencia, esDuplicado } = await registrarAsistenciaQR(
      claseId,
      req.user.usuarioId,
      qrToken,
      new Date(fechaDispositivo),
    );
    res.status(esDuplicado ? 200 : 201).json({ asistencia, esDuplicado });
  } catch (e) {
    if (e instanceof ErrorValidacion) {
      res.status(400).json({ error: e.message });
      return;
    }
    console.error("Error al registrar asistencia QR:", e);
    res.status(500).json({ error: "Error interno al registrar asistencia" });
  }
}];
