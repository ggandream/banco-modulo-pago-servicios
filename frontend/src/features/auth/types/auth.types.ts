import { z } from 'zod';

// Schemas de validación (ya existentes)
export const credentialsSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const twoFactorSchema = credentialsSchema.extend({
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

// Schema para el paso de credenciales dentro del form multi-paso (incluye code como string vacío por defecto)
export const loginFormCredentialsSchema = credentialsSchema.extend({
  code: z.string().default(''),
});

export type CredentialsValues = z.infer<typeof credentialsSchema>;
export type LoginFormValues = z.infer<typeof twoFactorSchema>;
export type LoginStep = 'credentials' | 'two-factor';

// Tipos de API
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  requires2FA: boolean;
  accessToken?: string;
  user?: User;
}

export interface Verify2FARequest {
  username: string;
  code: string;
}

export interface Verify2FAResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}
