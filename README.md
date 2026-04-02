# Banco - Módulo de Pago de Servicios

Sistema web de banca en línea que permite a cuentahabientes realizar pagos de servicios de **Agua** y **Electricidad**. Proyecto universitario (MVP).

## Tecnologías

| Capa       | Stack                                                  |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, Mantine 8, Vite 7, Zustand, React Hook Form |
| Backend    | NestJS 11, Prisma 7, JWT, bcrypt, Passport             |
| Base datos | PostgreSQL (Docker Compose)                            |

## Arquitectura

```
banco-modulo-pago-servicios/
├── backend/          # API REST (NestJS con Prisma)
│   ├── prisma/       # Schema, migraciones y seed
│   └── src/
│       ├── auth/         # Login JWT
│       ├── users/        # CRUD usuarios (admin)
│       ├── cuentas/      # Cuentas bancarias
│       ├── servicios/    # Tipos de servicio y empresas
│       ├── pagos/        # Lógica core de pagos
│       └── prisma/       # Módulo Prisma global
├── frontend/         # SPA (React y Mantine)
│   └── src/
│       ├── app/          # Router, layouts, config
│       └── features/
│           ├── auth/     # Login con store JWT
│           ├── pagos/    # Wizard de pago, historial, comprobante
│           ├── admin/    # Gestión de usuarios
│           ├── empresa/  # Consulta pagos por contador
│           └── perfil/   # Info personal y cuentas
└── docker-compose.yml
```

## Prerrequisitos

- Node.js 20+
- pnpm 10+
- Docker y Docker Compose

## Inicio rápido

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd banco-modulo-pago-servicios

cd backend && pnpm install
cd ../frontend && pnpm install
```

### 2. Levantar la base de datos

```bash
cd backend
docker compose up -d
```

### 3. Configurar variables de entorno

Crear `backend/.env` (ver `backend/.env.example`):

```env
DATABASE_URL="postgresql://root:root@localhost:5432/mydb?schema=public"
JWT_SECRET="banco_modulo_secret_2026"
```

### 4. Migrar y poblar la base de datos

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Levantar los servicios

```bash
# Terminal 1 - Backend
cd backend
pnpm start:dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Usuarios de prueba

| Usuario           | Contraseña  | Rol                    |
| ----------------- | ----------- | ---------------------- |
| admin             | admin123    | Administrador          |
| juan.perez        | user123     | Cuentahabiente         |
| maria.garcia      | user123     | Cuentahabiente         |
| energuate.admin   | empresa123  | Empresa de Servicios   |

## Contadores de prueba

- `CTR-E-001` - Energuate de Occidente (Juan ya pagó Enero y Febrero)
- `CTR-E-002` - Energuate de Oriente
- `CTR-A-001` - Empagua
- `CTR-A-002` - Empagua

## API Endpoints

| Método | Ruta                            | Descripción                        | Auth |
| ------ | ------------------------------- | ---------------------------------- | ---- |
| POST   | `/api/auth/login`               | Iniciar sesión (retorna JWT)       | No   |
| GET    | `/api/users`                    | Listar usuarios                    | Admin|
| POST   | `/api/users`                    | Crear usuario                      | Admin|
| PATCH  | `/api/users/:id`                | Actualizar usuario                 | Admin|
| DELETE | `/api/users/:id`                | Eliminar usuario                   | Admin|
| GET    | `/api/cuentas`                  | Cuentas del usuario autenticado    | JWT  |
| GET    | `/api/servicios/tipos`          | Tipos de servicio                  | JWT  |
| GET    | `/api/servicios/empresas`       | Empresas de servicio               | JWT  |
| GET    | `/api/pagos/deuda`              | Calcular deuda de un contador      | JWT  |
| POST   | `/api/pagos`                    | Crear pago (transacción completa)  | JWT  |
| GET    | `/api/pagos/historial`          | Historial de pagos del usuario     | JWT  |
| GET    | `/api/pagos/empresa/:empresaId` | Pagos recibidos por empresa        | JWT  |

## Flujo principal de pago

1. Usuario inicia sesión
2. Selecciona tipo de servicio (Agua / Electricidad)
3. Selecciona empresa proveedora
4. Ingresa número de contador y selecciona cuenta bancaria
5. El sistema calcula la deuda pendiente
6. Confirma el pago
7. El sistema ejecuta una transacción: debita la cuenta, registra el pago, genera comprobante e historial
8. Se muestra el comprobante en pantalla

## Modelo de datos

10 modelos en Prisma: **Rol**, **Usuario**, **CuentaBancaria**, **TipoServicio**, **EmpresaServicio**, **ContadorServicio**, **Pago**, **HistorialPagos**, **TarifasServicio**, **Comprobante**.

## Funcionalidades por rol

| Rol                  | Funcionalidades                                           |
| -------------------- | --------------------------------------------------------- |
| Administrador        | Dashboard de stats, gestión de usuarios (CRUD)            |
| Cuentahabiente       | Pagar servicios, ver historial, ver comprobantes, perfil  |
| Empresa de Servicios | Consultar pagos recibidos por número de contador          |

## Simplificaciones del MVP

- Sin autenticación de dos factores (2FA)
- Verificación de roles inline (sin decoradores RBAC)
- Sin paginación (retorna todos los registros)
- Tarifas solo configurables vía seed
- Contadores ingresados manualmente por el usuario
- Comprobante en pantalla (sin generación de PDF)

## Diagramas

Los diagramas del proyecto están en la carpeta `mermaid/` en formato Mermaid (`.mmd`). Se pueden visualizar con la extensión "Markdown Preview Mermaid Support" en VS Code o en [mermaid.live](https://mermaid.live).

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `01-arquitectura-sistema.mmd` | `graph` | Vista general de Frontend, Backend (módulos) y DB |
| `02-flujo-autenticacion.mmd` | `sequenceDiagram` | Login completo con validaciones (usuario no encontrado, desactivado, password incorrecto, éxito) |
| `03-flujo-pago-servicios.mmd` | `sequenceDiagram` | Wizard de 5 pasos: tipo servicio, empresa, formulario con cálculo de deuda, confirmación, comprobante |
| `04-modelo-entidad-relacion.mmd` | `erDiagram` | Los 10 modelos de Prisma con atributos y relaciones |
| `05-flujo-navegacion-roles.mmd` | `flowchart` | Qué ve cada rol (Admin, Cuentahabiente, Empresa) después del login |
| `06-transaccion-pago.mmd` | `flowchart` | Detalle interno de la transacción atómica con todas las validaciones y errores |

## Servicios Docker

- **PostgreSQL:** `localhost:5432` (user: `root`, password: `root`, db: `mydb`)
- **pgAdmin:** `http://localhost:5050` (email: `admin@admin.com`, password: `admin`)

## Authores

- ANDREA MELISSA GARRIDO GUERRA - 092-16-1557
- LUIS HUMBERTO RUIZ CASTILLO - 2692-19-5908
- LUIS RENATO GRANADOS OGALDEZ - 2392-19-4642
- MARLON ENRIQUE CAAL TUPIL - 2392-16-14769
