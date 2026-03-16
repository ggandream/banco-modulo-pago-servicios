import { z } from 'zod';

export const credentialsSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contrasena es requerida'),
});

export const loginFormSchema = credentialsSchema;

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
}
