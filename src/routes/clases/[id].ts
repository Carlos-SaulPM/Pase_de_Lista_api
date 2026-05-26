import { Request, Response } from "express";
import {
  obtenerClasePorId,
  actualizarClase,
  desactivarClase,
} from "#/services/ClaseService.js";
import { actualizarClaseSchema } from "#/schemas/ClaseSchemas.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/clases/{id}:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Obtener clase por ID
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
 *         description: Datos de la clase con relaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 materiaId:
 *                   type: integer
 *                 profesorId:
 *                   type: integer
 *                 grupo:
 *                   type: string
 *                 periodo:
 *                   type: string
 *                   nullable: true
 *                 materia:
 *                   type: object
 *                 profesor:
 *                   type: object
 *       404:
 *         description: Clase no encontrada
 *   put:
 *     tags:
 *       - Profesor
 *     summary: Actualizar clase
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
 *               materiaId:
 *                 type: integer
 *               grupo:
 *                 type: string
 *               periodo:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Clase actualizada
 *       404:
 *         description: Clase no encontrada
 *   delete:
 *     tags:
 *       - Profesor
 *     summary: Desactivar clase
 *     description: 'Eliminación lógica de la clase (establece estaActivo: false y fechaDeBaja)'
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
 *         description: Clase desactivada
 *       404:
 *         description: Clase no encontrada
 */
export const GET = [
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const clase = await obtenerClasePorId(id);
    if (clase.configuracion) {
      const { llaveSecreta, ...configSinLlave } = clase.configuracion;
      clase.configuracion = configSinLlave as typeof clase.configuracion;
    }
    res.json(clase);
  },
];

export const PATCH = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const validacion = actualizarClaseSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const resultado = await actualizarClase(id, validacion.data);
    res.json(resultado);
  },
];

export const DELETE = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await desactivarClase(id);
    res.json({ mensaje: "Clase desactivada exitosamente" });
  },
];
