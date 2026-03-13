import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { LoginFormValues } from '../types/auth.types';

interface CredentialsStepProps {
  isLoading: boolean;
}

export function CredentialsStep({ isLoading }: CredentialsStepProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginFormValues>();

  return (
    <>
      <TextInput
        label='Nombre de usuario'
        placeholder='jhondoe'
        radius='md'
        error={errors.username?.message}
        autoFocus={true}
        {...register('username')}
      />

      <PasswordInput
        label='Contraseña'
        placeholder='Tu contraseña'
        radius='md'
        mt='md'
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type='submit' variant='cta' fullWidth mt='xl' radius='md' loading={isLoading}>
        Iniciar sesión
      </Button>
    </>
  );
}
