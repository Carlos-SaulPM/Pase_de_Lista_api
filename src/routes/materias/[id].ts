import { Request, Response } from "express";
import { obtenerMateriaPorId, actualizarMateria, eliminarMateria } from "#/services/MateriaService.js";
import { actualizarMateriaSchema } from "#/schemas/MateriaSchemas.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/materias/{id}:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Obtener materia por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la materia
 *       404:
 *         description: Materia no encontrada
 *   put:
 *     tags:
 *       - Desarrollo
 *     summary: Actualizar materia
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               clave:
 *                 type: string
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Materia actualizada
 *       404:
 *         description: Materia no encontrada
 *   delete:
 *     tags:
 *       - Desarrollo
 *     summary: Eliminar materia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Materia eliminada
 *       404:
 *         description: Materia no encontrada
 */
export const GET = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const materia = await obtenerMateriaPorId(id);
  res.json(materia);
}];

export const PUT = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const validacion = actualizarMateriaSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
    return;
  }

  const resultado = await actualizarMateria(id, validacion.data);
  res.json(resultado);
}];

export const DELETE = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await eliminarMateria(id);
  res.json({ mensaje: "Materia eliminada exitosamente" });
}];
