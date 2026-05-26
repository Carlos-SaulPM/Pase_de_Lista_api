import { Request, Response } from "express";
import { obtenerUsuarioPorId, actualizarUsuario, eliminarUsuario } from "#/services/UsuarioService.js";
import { actualizarUsuarioSchema } from "#/schemas/UsuarioSchemas.js";
import { authMiddleware, requireRol } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Obtener usuario por ID
 *     description: Obtiene los datos de un usuario específico incluyendo su credencial
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
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *   put:
 *     tags:
 *       - Desarrollo
 *     summary: Actualizar usuario
 *     description: Actualiza los datos de un usuario existente
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
 *               nombre:
 *                 type: string
 *               apellidoPaterno:
 *                 type: string
 *               apellidoMaterno:
 *                 type: string
 *               correo:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [ALUMNO, PROFESOR]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *   delete:
 *     tags:
 *       - Desarrollo
 *     summary: Eliminar usuario
 *     description: Desactiva las credenciales del usuario (eliminación lógica)
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
 *         description: Usuario desactivado
 *       404:
 *         description: Usuario no encontrado
 */
export const GET = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const usuario = await obtenerUsuarioPorId(id);
  res.json(usuario);
}];

export const PUT = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const validacion = actualizarUsuarioSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos inválidos", detalles: validacion.error.errors });
    return;
  }

  const resultado = await actualizarUsuario(id, validacion.data);
  res.json(resultado);
}];

export const DELETE = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await eliminarUsuario(id);
  res.json({ mensaje: "Usuario desactivado exitosamente" });
}];
