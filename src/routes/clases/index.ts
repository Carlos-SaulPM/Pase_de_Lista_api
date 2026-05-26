import { Request, Response } from "express";
import { listarClases, crearNuevaClase } from "#/services/ClaseService.js";
import { crearClaseSchema } from "#/schemas/ClaseSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/clases:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Listar todas las clases
 *     description: Obtiene la lista de todas las clases activas con su materia y profesor
 *     responses:
 *       200:
 *         description: Lista de clases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   materiaId:
 *                     type: integer
 *                   profesorId:
 *                     type: integer
 *                   grupo:
 *                     type: string
 *                   periodo:
 *                     type: string
 *                     nullable: true
 *                   materia:
 *                     type: object
 *                   profesor:
 *                     type: object
 *   post:
 *     tags:
 *       - Profesor
 *     summary: Crear una nueva clase
 *     description: Registra una nueva clase. Si se envía profesorId se usa ese; si no, del JWT autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materiaId
 *               - grupo
 *             properties:
 *               materiaId:
 *                 type: integer
 *               grupo:
 *                 type: string
 *                 description: Identificador del grupo (ej. "G12")
 *               periodo:
 *                 type: string
 *                 nullable: true
 *                 description: Periodo escolar (opcional)
 *               profesorId:
 *                 type: integer
 *                 description: ID del profesor (opcional, solo para admin; por defecto del JWT)
 *     responses:
 *       201:
 *         description: Clase creada exitosamente. Incluye configuración automática con llaveSecreta para TOTP.
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
export const GET = [authMiddleware, requireRol("ADMINISTRADOR"), async (_req: AutenticatedRequest, res: Response) => {
  const clases = await listarClases();
  res.json(clases);
}];

export const POST = [
  authMiddleware,
  requireRol("ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const validacion = crearClaseSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    const resultado = await crearNuevaClase({
      ...validacion.data,
      profesorId: validacion.data.profesorId ?? req.user.usuarioId,
    });
    res.status(201).json(resultado);
  },
];
