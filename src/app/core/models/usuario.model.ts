import { Rol } from './enums';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  rol: string;
  nombre?: string;
  iat: number;
  exp: number;
}

export interface UsuarioSesion {
  email: string;
  rol: Rol;
  nombre: string;
}
