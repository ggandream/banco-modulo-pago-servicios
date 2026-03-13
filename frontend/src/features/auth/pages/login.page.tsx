import { Container, Group, Paper, Title } from '@mantine/core';
import { LoginForm } from '../components/login-form';
import styles from './styles.module.css';
import { Logo } from '@/shared/components/ui/Logo/index';

export function LoginPage() {
  return (
    <div className={styles.mainContainer}>
      <Container size={400} className={styles.container}>
        <Paper p={36} radius='lg' className={styles.paper}>
          <Group justify='center' mb='md'>
            <Logo size={128} />
          </Group>
          <Title order={2} ta='center' mb='lg' fw={600}>
            Inicio de sesión
          </Title>
          <LoginForm />
        </Paper>
      </Container>
    </div>
  );
}
