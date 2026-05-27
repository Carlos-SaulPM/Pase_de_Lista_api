import { Request, Response } from "express";
import { listarInscripcionesPorClase, crearNuevaInscripcion, crearNuevaInscripcionBatch } from "#/services/InscripcionService.js";
import { crearInscripcionSchema } from "#/schemas/InscripcionSchemas.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";

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
 *     summary: Inscribir alumno(s) en una clase
 *     description: |
 *       Busca al alumno por matricula y lo inscribe en la clase.
 *       Soporta una matricula individual o un array de matriculas.
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
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - matricula
 *                 properties:
 *                   matricula:
 *                     type: string
 *                     description: Matricula del alumno a inscribir
 *               - type: object
 *                 required:
 *                   - matriculas
 *                 properties:
 *                   matriculas:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Alumno(s) inscrito(s) exitosamente
 *       400:
 *         description: Datos invalidos
 */
export const GET = [authMiddleware, requireRol("PROFESOR", "ADMINISTRADOR"), async (req: Request, res: Response) => {
  const claseId = Number(req.params.claseId);
  const inscripciones = await listarInscripcionesPorClase(claseId);
  res.json(inscripciones);
}];

export const POST = [authMiddleware, requireRol("PROFESOR", "ADMINISTRADOR"), async (req: Request, res: Response) => {
  const claseId = Number(req.params.claseId);
  const validacion = crearInscripcionSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  if (validacion.data.matriculas) {
    const resultados = await crearNuevaInscripcionBatch(claseId, validacion.data.matriculas);
    res.status(201).json(resultados);
  } else {
    try {
      const resultado = await crearNuevaInscripcion({ claseId, matricula: validacion.data.matricula! });
      res.status(201).json(resultado);
    } catch (e) {
      if (e instanceof ErrorConflicto) {
        res.status(409).json({ error: e.message });
        return;
      }
      throw e;
    }
  }
}];
