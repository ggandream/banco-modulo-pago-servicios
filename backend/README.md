# Banco - Módulo Pago de Servicios (Backend)

API backend construida con NestJS + Prisma para el módulo web de Banco.

## Tecnologías

- NestJS 11
- Prisma 7 (con driver adapter `@prisma/adapter-pg`)
- PostgreSQL (vía Docker Compose)
- JWT + bcrypt (autenticación)
- Jest (pruebas unitarias + e2e)

## Prerrequisitos

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Inicio rápido

### 1. Instalar dependencias

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

### 2. Levantar la base de datos (PostgreSQL con Docker)

```bash
cd backend
docker compose up -d
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la carpeta `backend/` tomando como referencia `.env.example`. La configuración por defecto del `docker-compose.yml` es:

```env
DATABASE_URL="postgresql://root:root@localhost:5432/mydb?schema=public"
JWT_SECRET="banco_modulo_secret_2026"
```

### 4. Crear migración e inicializar la base de datos

```bash
cd backend
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### 5. Ejecutar el seed (datos de prueba)

```bash
cd backend
npx prisma db seed
```

### 6. Levantar el backend

```bash
cd backend
pnpm start:dev
```

### 7. Levantar el frontend (en otra terminal)

```bash
cd frontend
pnpm dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Servicios disponibles (Docker)

- **PostgreSQL:** `localhost:5432`
  - user: `root`
  - password: `root`
  - db: `mydb`
- **pgAdmin:** `http://localhost:5050`
  - email: `admin@admin.com`
  - password: `admin`

## Usuarios de prueba

| Usuario           | Contraseña  | Rol                    |
| ----------------- | ----------- | ---------------------- |
| admin             | admin123    | Administrador          |
| juan.perez        | user123     | Cuentahabiente         |
| maria.garcia      | user123     | Cuentahabiente         |
| energuate.admin   | empresa123  | Empresa de Servicios   |

## Contadores de prueba para pagos

- `CTR-E-001` - Energuate de Occidente (Juan ya pagó Enero y Febrero)
- `CTR-E-002` - Energuate de Oriente
- `CTR-A-001` - Empagua
- `CTR-A-002` - Empagua

## Estructura del proyecto

### Backend (módulos principales)

| Módulo           | Descripción                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `PrismaModule`   | Acceso global a la base de datos                                             |
| `AuthModule`     | Login con JWT y bcrypt                                                       |
| `UsersModule`    | CRUD de usuarios (admin)                                                     |
| `CuentasModule`  | Consulta de cuentas bancarias                                                |
| `ServiciosModule`| Tipos de servicio y empresas                                                 |
| `PagosModule`    | Cálculo de deuda, creación de pagos con transacción, comprobantes, historial, stats |

### Frontend (páginas principales)

| Archivo                  | Descripción                     |
| ------------------------ | ------------------------------- |
| `auth.store.ts`          | Zustand store con JWT           |
| `login-form.tsx`         | Conectado al API                |
| `dashboard.page.tsx`     | Stats por rol                   |
| `nuevo-pago.page.tsx`    | Wizard completo con Stepper     |
| `historial.page.tsx`     | Tabla de pagos                  |
| `comprobante.page.tsx`   | Vista de comprobante            |
| `usuarios.page.tsx`      | CRUD usuarios                   |
| `pagos-empresa.page.tsx` | Consulta por contador           |
| `perfil.page.tsx`        | Info personal y cuentas         |

### Prisma

- `schema.prisma` - 10 modelos: Rol, Usuario, CuentaBancaria, TipoServicio, EmpresaServicio, ContadorServicio, Pago, HistorialPagos, TarifasServicio, Comprobante
- `seed.ts` - Datos de prueba

## Scripts

```bash
# desarrollo (watch mode)
pnpm start:dev

# build
pnpm build

# producción
pnpm start:prod

# lint
pnpm lint

# format
pnpm format
```

## Tests

```bash
# pruebas unitarias
pnpm test

# pruebas en watch
pnpm test:watch

# pruebas e2e
pnpm test:e2e

# cobertura
pnpm test:cov
```

## Notas

- CORS está habilitado para `http://localhost:5173` (frontend con Vite).
- El servidor escucha en la variable de entorno `PORT` o en `3000` por defecto.
- Las contraseñas de los usuarios de prueba están encriptadas con bcrypt en el seed.
