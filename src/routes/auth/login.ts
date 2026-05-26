import { Request, Response } from "express";
import { loginSchema } from "#/schemas/AutenticacionSchemas.js";
import {
  iniciarSesion,
  ErrorAutenticacion,
} from "#/services/AutenticacionService.js";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticacion
 *     summary: Iniciar sesión
 *     description: Autentica al usuario con matrícula y contraseña, devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 detalles:
 *                   type: array
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const POST = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      res
        .status(400)
        .json({ error: "Datos inválidos", detalles: body.error.errors });
      return;
    }

    const { token } = await iniciarSesion(body.data);

    res.json({ token });
  } catch (error) {
    if (error instanceof ErrorAutenticacion) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
