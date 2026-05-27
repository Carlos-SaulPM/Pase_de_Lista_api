import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "#/types/AutenticacionTypes";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET no está definido en variables de entorno");
}

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export const crearToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: EXPIRES_IN as any };

  return jwt.sign(payload, SECRET, options);
};

export const verificarToken = (token: string) => {
  return jwt.verify(token, SECRET) as TokenPayload;
};
