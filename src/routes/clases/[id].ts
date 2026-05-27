import { Request, Response } from "express";
import {
  obtenerClasePorId,
  actualizarClase,
  desactivarClase,
} from "#/services/ClaseService.js";
import { actualizarClaseSchema } from "#/schemas/ClaseSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";

function fmt(t: Date): string {
  return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
}

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
    const clase: Record<string, unknown> = await obtenerClasePorId(id) as Record<string, unknown>;
    if (clase.configuracion && typeof clase.configuracion === "object" && clase.configuracion !== null) {
      const config = clase.configuracion as Record<string, unknown>;
      const { llaveSecreta, ...configSinLlave } = config;
      clase.configuracion = configSinLlave;
    }
    if (Array.isArray(clase.horarios)) {
      clase.horarios = (clase.horarios as { horaDeInicio: Date; horaDeFin: Date }[]).map((h) => ({
        ...h,
        horaDeInicio: fmt(h.horaDeInicio),
        horaDeFin: fmt(h.horaDeFin),
      }));
    }
    res.json(clase);
  },
];

export const PATCH = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const id = Number(req.params.id);
    const validacion = actualizarClaseSchema.safeParse(req.body);

    if (!validacion.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: validacion.error.errors });
      return;
    }

    if (req.user.rol === "PROFESOR") {
      const clase = await obtenerClasePorId(id);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }
    }

    const resultado = await actualizarClase(id, validacion.data);
    res.json(resultado);
  },
];

export const DELETE = [
  authMiddleware,
  requireRol("PROFESOR", "ADMINISTRADOR"),
  async (req: AutenticatedRequest, res: Response) => {
    const id = Number(req.params.id);

    if (req.user.rol === "PROFESOR") {
      const clase = await obtenerClasePorId(id);
      if (clase.profesorId !== req.user.usuarioId) {
        res.status(403).json({ error: "No eres el profesor de esta clase" });
        return;
      }
    }

    await desactivarClase(id);
    res.json({ mensaje: "Clase desactivada exitosamente" });
  },
];
