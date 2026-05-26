import { Request } from "express";
import { verificarToken } from "./jwt.js";

export const extraerTokenDelHeader = (req: Request) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

export const obtenerPayloadDelToken = (req: Request) => {
  const token = extraerTokenDelHeader(req);
  if (!token) return null;
  try {
    return verificarToken(token);
  } catch {
    return null;
  }
};
