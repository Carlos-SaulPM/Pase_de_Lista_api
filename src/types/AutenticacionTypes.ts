import { Rol } from "@prisma/client";

export interface LoginRequest {
  matricula: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
}

export interface TokenPayload {
  usuarioId: number;
  matricula: string;
  nombre: string;
  rol: string;
  exp?: number;
}

export interface PerfilResponse {
  id: number;
  nombre: string;
  correo: string | null;
  rol: Rol;
  matricula: string;
}
