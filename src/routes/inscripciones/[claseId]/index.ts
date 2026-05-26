import { Request, Response } from "express";
import { listarInscripcionesPorClase, crearNuevaInscripcion } from "#/services/InscripcionService.js";
import { crearInscripcionSchema } from "#/schemas/InscripcionSchemas.js";
import { authMiddleware } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/inscripciones/{claseId}:
 *   get:
 *     tags:
 *       - Profesor
 *     summary: Listar inscripciones de una clase
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
 *         description: Lista de inscripciones activas de la clase
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Inscribir alumno en una clase
 *     description: Busca al alumno por matricula y lo inscribe en la clase.
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
 *               - matricula
 *             properties:
 *               matricula:
 *                 type: string
 *                 description: Matricula del alumno a inscribir
 *     responses:
 *       201:
 *         description: Alumno inscrito exitosamente
 *       400:
 *         description: Datos invalidos
 *       404:
 *         description: Alumno no encontrado
 *       409:
 *         description: El alumno ya esta inscrito en esta clase
 */
export const GET = [authMiddleware, async (req: Request, res: Response) => {
  const claseId = Number(req.params.claseId);
  const inscripciones = await listarInscripcionesPorClase(claseId);
  res.json(inscripciones);
}];

export const POST = [authMiddleware, async (req: Request, res: Response) => {
  const claseId = Number(req.params.claseId);
  const validacion = crearInscripcionSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const resultado = await crearNuevaInscripcion({ claseId, matricula: validacion.data.matricula });
  res.status(201).json(resultado);
}];
