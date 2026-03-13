import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useForm } from '@/lib/form/use-form';
import { CredentialsStep } from './credentials-step';
import { LoginFormValues, LoginStep, loginFormCredentialsSchema, twoFactorSchema } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('credentials');
  
  const form = useForm<LoginFormValues>({
    schema: step === 'credentials' ? loginFormCredentialsSchema : twoFactorSchema,
    defaultValues: {
      username: '',
      password: '',
      code: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    navigate('/dashboard');
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 'credentials' && (
          <CredentialsStep isLoading={false} />
        )}
      </form>
    </FormProvider>
  );
}