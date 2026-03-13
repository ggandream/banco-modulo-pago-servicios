# Banco - Módulo Pago de Servicios (Frontend)

Frontend del módulo de pago de servicios bancarios. Aplicación SPA construida con **React 19**, **Vite 7** y **Mantine UI v8** con tema **violet**.

> **Estado actual:** Login y Dashboard iniciales (sin lógica de negocio ni validaciones conectadas al backend).

---

## Tech Stack

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | React | 19.1 |
| Bundler | Vite | 7.3 |
| Lenguaje | TypeScript | 5.9 |
| UI Library | Mantine (core, charts, notifications, spotlight) | 8.3 |
| Iconos | Tabler Icons React | 3.36 |
| Routing | React Router DOM | 7.13 |
| Estado global | Zustand | 5.0 |
| Estado servidor | TanStack React Query | 5.90 |
| Formularios | React Hook Form + @hookform/resolvers | 7.71 |
| Validación | Zod | 4.3 |
| Gráficos | Recharts | 3.7 |
| Drag & Drop | dnd-kit (core, sortable, utilities) | 6.3 / 10.0 |
| Linter | ESLint | 9.39 |

---

## Requisitos previos

- **Node.js** >= 18
- **pnpm** (gestor de paquetes)

---

## Instalación

```bash
cd frontend
pnpm install
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo en `http://localhost:5173` (con `--host` para acceso en red local) |
| `pnpm build` | Compila TypeScript y genera el bundle de producción en `dist/` |
| `pnpm preview` | Sirve el build de producción localmente para verificación |
| `pnpm start:prod` | Sirve el build de producción en el puerto `4173` |
| `pnpm lint` | Ejecuta ESLint sobre `src/` |
| `pnpm typecheck` | Verifica tipos con TypeScript (sin emitir archivos) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── config/             # Rutas y navegación centralizadas
│   ├── providers/          # Providers (Mantine, Router, React Query, Spotlight)
│   └── router/             # Definición de rutas y layouts (Header, Navbar)
├── assets/
│   └── images/             # Logo e imágenes estáticas
├── features/
│   ├── auth/               # Login (página, formulario, tipos)
│   ├── dashboard/          # Dashboard principal
│   ├── accessibility/      # Drawer de accesibilidad
│   └── underConstruction/  # Página placeholder para módulos pendientes
├── lib/
│   ├── form/               # Hook personalizado de formularios
│   ├── http/               # Cliente HTTP
│   └── notifications/      # Utilidades de toast/notificaciones
├── shared/
│   └── components/ui/      # Componentes reutilizables (DataTable, Logo, PageHeader, StatsCard, etc.)
├── App.tsx                 # Componente raíz
└── main.tsx                # Punto de entrada
```

---

## Tema y personalización

El tema de Mantine está configurado en `src/app/providers/Mantine/theme.ts`:

- **Color primario:** `violet`
- **Fuente:** `Inter, system-ui, sans-serif`
- **Variante custom:** Botón `cta` con sombra y colores del tema

---

## Path aliases

El proyecto usa el alias `@/` que apunta a `./src/`, configurado tanto en `vite.config.ts` como en `tsconfig.json`.

```ts
import { Something } from '@/shared/components/ui/Logo';
```

---

## Proxy de desarrollo

Vite está configurado para redirigir las peticiones `/api` al backend en `http://localhost:3000`:

```ts
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

---

## Rutas actuales

| Ruta | Página |
|---|---|
| `/login` | Login |
| `/dashboard` | Dashboard principal |
| `*` | Redirect a `/login` |
