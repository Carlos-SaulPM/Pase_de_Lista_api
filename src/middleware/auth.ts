import { Request, Response, NextFunction } from "express";
import { obtenerPayloadDelToken } from "#/lib/token.js";
import { TokenPayload } from "#/types/AutenticacionTypes.js";

export interface AutenticatedRequest extends Request {
  user: TokenPayload;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = obtenerPayloadDelToken(req);
  if (!payload) {
    res.status(401).json({ error: "Token invalido o no proporcionado" });
    return;
  }

  (req as AutenticatedRequest).user = payload;
  next();
};

export const requireRol = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AutenticatedRequest).user;
    if (!user || !roles.includes(user.rol)) {
      res.status(403).json({ error: "No tienes permiso para acceder a este recurso" });
      return;
    }
    next();
  };
};
