import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useForm } from '@/lib/form/use-form';
import { CredentialsStep } from './credentials-step';
import { LoginFormValues, LoginResponse, loginFormSchema } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '@/lib/http/client';
import { useAuthStore } from '../stores/auth.store';
import { notifications } from '@mantine/notifications';

export function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const form = useForm<LoginFormValues>({
    schema: loginFormSchema,
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await httpClient.post<LoginResponse>('/auth/login', {
        username: data.username,
        password: data.password,
      });
      login(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciales invalidas';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CredentialsStep isLoading={loading} />
      </form>
    </FormProvider>
  );
}
