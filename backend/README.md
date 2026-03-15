# Banco - Módulo Pago de Servicios (Backend)

API backend construida con NestJS + Prisma para el módulo web de Banco.

## Tecnologías

- NestJS 11
- Prisma 7
- PostgreSQL (vía Docker Compose)
- Jest (pruebas unitarias + e2e)

## Prerrequisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Inicio rápido

1. Instalar dependencias:

```bash
npm install
```

2. Levantar servicios de base de datos:

```bash
docker compose up -d
```

3. Configurar variables de entorno en `.env` tomar en cuenta .env.example el cual considera la configuracion establecidad en el archivo docker-compose.yml:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/base_de_datos?schema=public"

```

4. Generar Prisma Client

```bash
npx prisma generate
```

5. Para ejecutar alguna migración de Prisma y comprobar la conexion con la base de datos:


```bash
npx prisma migrate dev
```

6. Iniciar la API en modo desarrollo:

```bash
npm run start:dev
```

URL base de la API: `http://localhost:3000`

## Servicios disponibles (Docker)

- PostgreSQL: `localhost:5432`
	- user: `root`
	- password: `root`
	- db: `mydb`
- pgAdmin: `http://localhost:5050`
	- email: `admin@admin.com`
	- password: `admin`

## Scripts

```bash
# build
npm run build

# desarrollo
npm run start

# modo watch
npm run start:dev

# modo debug
npm run start:debug

# modo producción
npm run start:prod

# lint
npm run lint

# format
npm run format
```

## Tests

```bash
# pruebas unitarias
npm run test

# pruebas en watch
npm run test:watch

# pruebas e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Endpoints actuales

- `GET /tasks` → devuelve una lista mock de tareas
- el módulo `auth` está registrado en `/auth` (controlador base scaffolded)

## Notas

- CORS está habilitado para `http://localhost:5173` (valor por defecto del frontend con Vite).
- El servidor escucha en la variable de entorno `PORT` o en `3000` por defecto.
