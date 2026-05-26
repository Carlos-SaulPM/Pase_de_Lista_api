import { Request, Response, NextFunction } from "express";
import { ErrorAutenticacion } from "#/errors/ErrorAutenticacion.js";
import { ErrorConflicto } from "#/errors/ErrorConflicto.js";
import { ErrorRecursoNoEncontrado } from "#/errors/ErrorRecursoNoEncontrado.js";
import { ErrorValidacion } from "#/errors/ErrorValidacion.js";

export const manejarErrores = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ErrorAutenticacion) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ErrorConflicto) {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err instanceof ErrorRecursoNoEncontrado) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof ErrorValidacion) {
    res.status(400).json({ error: err.message, detalles: err.detalles });
    return;
  }

  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
};
