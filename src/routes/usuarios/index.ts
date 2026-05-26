import { Request, Response } from "express";
import { listarUsuarios, crearNuevoUsuario } from "#/services/UsuarioService.js";
import { crearUsuarioSchema } from "#/schemas/UsuarioSchemas.js";
import { authMiddleware, requireRol, AutenticatedRequest } from "#/middleware/auth.js";

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     tags:
 *       - Desarrollo
 *     summary: Listar todos los usuarios
 *     description: Obtiene la lista de todos los usuarios registrados
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   apellidoPaterno:
 *                     type: string
 *                   apellidoMaterno:
 *                     type: string
 *                   correo:
 *                     type: string
 *                     nullable: true
 *                   rol:
 *                     type: string
 *                     enum: [ALUMNO, PROFESOR]
 *   post:
 *     tags:
 *       - Desarrollo
 *     summary: Crear un nuevo usuario
 *     description: Crea un usuario junto con sus credenciales de acceso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidoPaterno
 *               - apellidoMaterno
 *               - rol
 *               - matricula
 *               - contrasena
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
 *               matricula:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
export const GET = [authMiddleware, requireRol("ADMINISTRADOR"), async (_req: AutenticatedRequest, res: Response) => {
  const usuarios = await listarUsuarios();
  res.json(usuarios);
}];

export const POST = [authMiddleware, requireRol("ADMINISTRADOR"), async (req: AutenticatedRequest, res: Response) => {
  const validacion = crearUsuarioSchema.safeParse(req.body);

  if (!validacion.success) {
    res.status(400).json({ error: "Datos invalidos", detalles: validacion.error.errors });
    return;
  }

  const resultado = await crearNuevoUsuario(validacion.data);
  res.status(201).json(resultado);
}];
