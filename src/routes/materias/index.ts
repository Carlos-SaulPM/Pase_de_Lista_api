import { Request, Response } from "express";
import {
  listarMaterias,
  crearNuevaMateria,
} from "#/services/MateriaService.js";
import { crearMateriaSchema } from "#/schemas/MateriaSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/materias:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Listar todas las materias
 *     description: Obtiene la lista de todas las materias registradas
 *     responses:
 *       200:
 *         description: Lista de materias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   clave:
 *                     type: string
 *                   nombre:
 *                     type: string
 *   post:
 *     tags:
 *       - Desarrollo
 *     summary: Crear una nueva materia
 *     description: Registra una nueva materia en el sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clave
 *               - nombre
 *             properties:
 *               clave:
 *                 type: string
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Materia creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
export const GET = [authMiddleware, requireRol("ADMINISTRADOR"), async (_req: AutenticatedRequest, res: Response) => {
  const materias = await listarMaterias();
  res.json(materias);
}];

export const POST = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: Request, res: Response) => {
    const validacion = crearMateriaSchema.safeParse(req.body);
    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const resultado = await crearNuevaMateria(validacion.data);
    res.status(201).json(resultado);
  },
];
