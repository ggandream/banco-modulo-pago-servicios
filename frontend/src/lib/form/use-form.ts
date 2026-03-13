import { useForm as useHookForm, UseFormProps, FieldValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema?: z.ZodType<T, FieldValues>;
}

export function useForm<T extends FieldValues>({ schema, ...options }: UseFormOptions<T> = {}) {
  return useHookForm<T>({
    ...options,
    resolver: schema ? (zodResolver(schema) as Resolver<T>) : undefined,
  });
}