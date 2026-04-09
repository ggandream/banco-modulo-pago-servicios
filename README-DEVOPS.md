# Guia DevOps - Banco Modulo Pago de Servicios

Guia paso a paso para implementar practicas DevOps en el MVP de pago de servicios bancarios.
Cubre contenerizacion, CI/CD, orquestacion con Kubernetes y monitoreo con seguridad.

> **Stack:** React/Vite/Mantine + NestJS/Prisma + PostgreSQL
> **Entorno:** 100% local, herramientas open-source y gratuitas

## Conceptos

### ghcr.io

ghcr.io es GitHub Container Registry, el registry de imágenes Docker que viene integrado con GitHub. Pensalo como el "almacén de imágenes Docker" de GitHub.
Es la alternativa de GitHub a Docker Hub. La ventaja es que vive dentro del mismo ecosistema, no necesita credenciales extra: tus imágenes quedan asociadas directamente a tu repositorio.

Por ejemplo:

ghcr.io/<owner>/banco-modulo-pago-servicios/backend:<sha>
ghcr.io/<owner>/banco-modulo-pago-servicios/frontend:<sha>

---

## Tabla de contenidos

- [Prerequisitos](#prerequisitos)
- [Fase 1: Contenerizacion del MVP](#fase-1-contenerizacion-del-mvp)
- [Fase 2: Pipeline CI/CD con GitHub Actions](#fase-2-pipeline-cicd-con-github-actions)
- [Fase 3: Orquestacion con Kubernetes Local](#fase-3-orquestacion-con-kubernetes-local)
- [Fase 4: Monitoreo, Observabilidad y Seguridad](#fase-4-monitoreo-observabilidad-y-seguridad)
- [Referencia rapida de puertos](#referencia-rapida-de-puertos)
- [Estructura de archivos DevOps](#estructura-de-archivos-devops)
- [Troubleshooting](#troubleshooting)

---

## Prerequisitos

Antes de comenzar, asegurense de tener instalado:

| Herramienta | Version minima | Verificar instalacion |
|-------------|---------------|----------------------|
| Git | 2.x | `git --version` |
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Node.js | 20.x | `node --version` |
| pnpm | 10.x | `pnpm --version` |

**Para la Fase 3 (Kubernetes) tambien necesitaran:**

| Herramienta | Verificar instalacion |
|-------------|----------------------|
| Minikube | `minikube version` |
| kubectl | `kubectl version --client` |
| Helm | `helm version` |

**Recursos minimos de la maquina:**

- RAM: 8 GB minimo (16 GB recomendado)
- Disco: 20 GB libres
- CPU: 4 cores

---

## Fase 1: Contenerizacion del MVP

**Objetivo:** Levantar todo el sistema (frontend + backend + base de datos) con un solo comando usando Docker.

### 1.1 Archivos creados

| Archivo | Que hace |
|---------|----------|
| `backend/Dockerfile` | Multi-stage build: instala deps, genera Prisma, compila NestJS, imagen final ligera |
| `backend/entrypoint.sh` | Script que espera a PostgreSQL, ejecuta migraciones y arranca el servidor |
| `frontend/Dockerfile` | Multi-stage build: compila Vite, sirve con Nginx |
| `frontend/nginx.conf` | Configura Nginx como proxy reverso (`/api/` -> backend) y sirve la SPA |
| `docker-compose.yml` | Orquesta los 4 servicios con red interna y volumen persistente |
| `backend/.dockerignore` | Excluye `node_modules`, `dist`, `.env` del build |
| `frontend/.dockerignore` | Excluye `node_modules`, `dist`, `.env` del build |

### 1.2 Entender los Dockerfiles

**Backend (multi-stage):**

```
Stage 1 (deps)       -> Instala dependencias con pnpm
Stage 2 (build)      -> Genera Prisma Client + compila NestJS
Stage 3 (production) -> Solo copia dist/, node_modules/, prisma/ -> imagen final ligera
```

**Frontend (multi-stage):**

```
Stage 1 (build)      -> Instala dependencias + ejecuta `pnpm build` (Vite)
Stage 2 (production) -> Copia el `dist/` a Nginx Alpine -> imagen final ~30MB
```

### 1.3 Levantar el sistema

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd banco-modulo-pago-servicios
```

**Primera vez (con datos de prueba):**

```bash
RUN_SEED=true docker compose up --build
```
En windows (PowerShell):
```bash
$env:RUN_SEED="true"; docker compose up -d --build
```

**Siguientes veces:**

```bash
docker compose up --build
```

**En segundo plano (detached):**

```bash
docker compose up -d --build
```

### 1.4 Verificar que funciona

1. Abrir **http://localhost:8080** en el navegador (frontend)
2. Iniciar sesion con usuario `admin` / contraseña `admin123`
3. Verificar que el backend responde en **http://localhost:3000/api**

### 1.5 Comandos utiles de Docker

```bash
# Ver logs de un servicio especifico
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener todo
docker compose down

# Detener y eliminar volumenes (BORRA la base de datos)
docker compose down -v

# Ver el estado de los contenedores
docker compose ps
```

### 1.6 Como funciona la persistencia

El `docker-compose.yml` define un volumen llamado `postgres_data`. Esto significa que:
- Los datos de PostgreSQL sobreviven a `docker compose down`
- Solo se pierden si ejecutan `docker compose down -v` (flag `-v` elimina volumenes)
- El backend ejecuta `prisma migrate deploy` automaticamente al iniciar

---

## Fase 2: Pipeline CI/CD con GitHub Actions

**Objetivo:** Automatizar validacion, construccion y publicacion del codigo en cada push o PR.

### 2.1 Archivos creados

| Archivo | Que hace |
|---------|----------|
| `.github/workflows/ci.yml` | Pipeline de integracion continua (lint, test, build, Docker build, Trivy) |
| `.github/workflows/cd.yml` | Pipeline de entrega continua (push imagenes a ghcr.io) |

¿Por qué no tiene credenciales?

CI (ci.yml) → Sí, cero configuración.
Lint, tests, build, y Trivy corren completamente en el runner de GitHub. No necesitás ningún secret ni key.

CD (cd.yml) → También, pero hay que entender por qué.
Fijate en esta parte:

username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}

GITHUB_TOKEN es un secret que GitHub genera automáticamente en cada ejecución del workflow. No lo tenés que crear ni configurar vos. Viene incluido y tiene permisos para pushear a ghcr.io porque el workflow ya declara esto:

### 2.2 Como funciona el CI

El workflow `ci.yml` se ejecuta en cada **push** y **pull request** a `main` o `develop`.

```
Push/PR a main o develop
        |
        v
+-------------------+     +--------------------+
| Backend (job)     |     | Frontend (job)     |    <- Corren en PARALELO
|                   |     |                    |
| 1. pnpm install   |     | 1. pnpm install    |
| 2. prisma generate|     | 2. pnpm lint       |
| 3. pnpm lint      |     | 3. pnpm typecheck  |
| 4. pnpm test      |     | 4. pnpm build      |
| 5. pnpm build     |     | 5. pnpm audit      |
| 6. pnpm audit     |     |                    |
+--------+----------+     +---------+----------+
         |                           |
         +----------+----------------+
                    |
                    v
      +----------------------------+
      | Docker Build & Scan (job)  |    <- Solo si ambos pasan
      |                            |
      | 1. Build backend image     |
      | 2. Build frontend image    |
      | 3. Trivy scan backend      |
      | 4. Trivy scan frontend     |
      +----------------------------+
```

**Puntos clave:**
- El backend usa un **service container** de PostgreSQL para correr tests con BD real
- **Trivy** escanea las imagenes y falla el pipeline si hay vulnerabilidades CRITICAL
- Se usa **cache de pnpm** y **cache de Docker layers** para builds rapidos

### 2.3 Como funciona el CD

El workflow `cd.yml` se ejecuta **solo en merge a `main`**.

```
Merge a main
     |
     v
+--------------------------------+
| 1. Login a ghcr.io             |
| 2. Build backend image         |
| 3. Push backend a ghcr.io      |
|    Tag: <sha-del-commit>       |
|    Tag: latest                 |
| 4. Build frontend image        |
| 5. Push frontend a ghcr.io     |
|    Tag: <sha-del-commit>       |
|    Tag: latest                 |
+--------------------------------+
```

Las imagenes quedan publicadas en:
- `ghcr.io/<owner>/banco-modulo-pago-servicios/backend:<sha>`
- `ghcr.io/<owner>/banco-modulo-pago-servicios/frontend:<sha>`

> **Nota:** No necesitan crear secrets adicionales. El `GITHUB_TOKEN` viene incluido automaticamente.

### 2.4 Configurar Branch Protection (manual en GitHub)

Para que un PR con tests fallidos **no se pueda mergear**:

1. Ir al repositorio en GitHub
2. **Settings** > **Branches** > **Add branch protection rule**
3. Branch name pattern: `main`
4. Marcar **"Require status checks to pass before merging"**
5. Buscar y seleccionar estos checks:
   - `Backend - Lint, Test & Build`
   - `Frontend - Lint, Typecheck & Build`
   - `Docker - Build & Security Scan`
6. Guardar cambios

### 2.5 Flujo de trabajo con ramas

Recomendamos usar Git Flow simplificado:

```
main          <-- Produccion (protegida, solo merge via PR)
  |
develop       <-- Integracion (los PRs van aqui primero)
  |
feature/*     <-- Ramas de trabajo individual
```

```bash
# Crear una rama de feature
git checkout develop
git checkout -b feature/mi-cambio

# Trabajar, hacer commits...
git add .
git commit -m "Agregar mi cambio"

# Push y crear PR hacia develop
git push -u origin feature/mi-cambio
# Ir a GitHub y crear el PR
```

---

## Fase 3: Orquestacion con Kubernetes Local (me quedé por aquí 😝)

**Objetivo:** Desplegar el sistema en un cluster Kubernetes local con Minikube y Helm.

### 3.1 Archivos creados

```
helm/banco-app/
├── Chart.yaml                           # Metadata del chart
├── values.yaml                          # Valores configurables
└── templates/
    ├── _helpers.tpl                     # Funciones helper reutilizables
    ├── NOTES.txt                        # Instrucciones post-instalacion
    ├── configmap.yaml                   # Variables no sensibles (DB_HOST, PORT, etc.)
    ├── secret.yaml                      # Credenciales codificadas en base64
    ├── postgres-statefulset.yaml        # BD con almacenamiento persistente (PVC)
    ├── postgres-service.yaml            # ClusterIP para acceso interno
    ├── backend-deployment.yaml          # NestJS con liveness/readiness probes
    ├── backend-service.yaml             # ClusterIP para acceso interno
    ├── backend-hpa.yaml                 # Autoscaling: 2-5 replicas por CPU
    ├── frontend-deployment.yaml         # Nginx con liveness/readiness probes
    ├── frontend-service.yaml            # NodePort para acceso externo
    └── ingress.yaml                     # Enrutamiento: / -> frontend, /api -> backend
```

### 3.2 Instalar Minikube

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**macOS:**
```bash
brew install minikube
```

**Windows (PowerShell como admin):**
```powershell
choco install minikube
```

Verificar:
```bash
minikube version
```

### 3.3 Instalar kubectl y Helm

```bash
# kubectl (Linux)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# Helm (Linux/macOS)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 3.4 Iniciar Minikube y preparar el entorno

```bash
# Iniciar cluster (ajustar recursos segun su maquina)
minikube start --cpus=4 --memory=4096 --driver=docker

# Habilitar addons necesarios
minikube addons enable ingress
minikube addons enable metrics-server

# Verificar que el cluster esta listo
kubectl get nodes
# Deberia mostrar: STATUS = Ready
```

### 3.5 Construir imagenes dentro de Minikube

Minikube tiene su propio Docker daemon. Necesitamos construir las imagenes ahi para que Kubernetes las encuentre:

```bash
# Apuntar Docker al daemon de Minikube
eval $(minikube docker-env)

# Apuntar Docker al daemon de Minikube (version PowerShell)
minikube docker-env | Invoke-Expression

# Construir las imagenes (desde la raiz del proyecto)
docker build -t banco-backend:latest ./backend
docker build -t banco-frontend:latest ./frontend

# Verificar que las imagenes existen
docker images | grep banco

# Verificar que las imagenes existen (version PowerShell)
docker images | Select-String "banco"
```

> **Importante:** Cada vez que abran una nueva terminal, deben ejecutar `eval $(minikube docker-env)` de nuevo.

### 3.6 Desplegar con Helm

```bash
# Instalar el chart
helm install banco ./helm/banco-app

# Ver el estado del despliegue
kubectl get pods -w
# Esperar a que todos los pods esten en STATUS: Running
```

### 3.7 Seed de la base de datos (primera vez)

```bash
# Activar seed
kubectl set env deployment/banco-backend RUN_SEED=true

# Reiniciar el deployment para que el pod tome la nueva variable
kubectl rollout restart deployment/banco-backend

# Esperar a que el pod nuevo este listo
kubectl rollout status deployment/banco-backend

# Desactivar seed (para que no se ejecute en cada reinicio)
kubectl set env deployment/banco-backend RUN_SEED=false
```

### 3.8 Acceder a la aplicacion

**Opcion A: Usando Ingress (recomendado)**

```bash
# Obtener la IP de Minikube
minikube ip

# Agregar entrada al archivo hosts
# Linux/macOS:
echo "$(minikube ip)  banco.local" | sudo tee -a /etc/hosts

# Windows (PowerShell como admin):
Add-Content C:\Windows\System32\drivers\etc\hosts "$(minikube ip)  banco.local"
```

Abrir **http://banco.local** en el navegador.

**Opcion B: Usando port-forward**

```bash
# En una terminal:
kubectl port-forward svc/banco-frontend 8080:80

# En otra terminal:
kubectl port-forward svc/banco-backend 3000:3000
```

Abrir **http://localhost:8080** en el navegador.

### 3.9 Comandos utiles de Kubernetes

```bash
# Para obtener la URL exacta:
minikube service banco-frontend --url

# Ver todos los recursos desplegados
kubectl get all

# Ver logs de un pod
kubectl logs -f deployment/banco-backend

# Describir un pod (util para debugging)
kubectl describe pod <nombre-del-pod>

# Ver los health checks en accion
kubectl get pods -o wide

# Probar auto-healing: eliminar un pod y ver como se recrea
kubectl delete pod <nombre-del-pod-backend>
kubectl get pods -w  # Observar como Kubernetes crea uno nuevo

# Ver el HPA (Horizontal Pod Autoscaler)
kubectl get hpa

# Ver los secrets (las credenciales NO estan hardcodeadas)
kubectl get secrets
kubectl describe secret banco-secret

# Desinstalar todo
helm uninstall banco

# Detener Minikube
minikube stop
```

### 3.10 Conceptos clave demostrados

| Concepto | Donde se ve |
|----------|-------------|
| **Pods** | `kubectl get pods` - cada contenedor corre en un pod |
| **Deployments** | Backend (2 replicas), Frontend (1 replica) |
| **StatefulSet** | PostgreSQL con almacenamiento persistente |
| **Services** | ClusterIP (comunicacion interna), NodePort (acceso externo) |
| **Ingress** | Enruta trafico: `/` -> frontend, `/api` -> backend |
| **ConfigMap** | Variables no sensibles: `DB_HOST`, `PORT`, etc. |
| **Secret** | Credenciales: `DATABASE_URL`, `JWT_SECRET`, passwords |
| **PVC** | Volumen persistente para PostgreSQL |
| **Liveness Probe** | Si el pod no responde, Kubernetes lo reinicia |
| **Readiness Probe** | Si el pod no esta listo, no recibe trafico |
| **HPA** | Backend escala de 2 a 5 pods cuando CPU > 70% |

---

## Fase 4: Monitoreo, Observabilidad y Seguridad

### 4a. Monitoreo y Observabilidad

**Objetivo:** Visibilidad completa del sistema con metricas, logs y dashboards.

#### Archivos creados

| Archivo | Que hace |
|---------|----------|
| `backend/src/metrics/metrics.module.ts` | Modulo global de metricas Prometheus |
| `backend/src/metrics/metrics.service.ts` | Define metricas HTTP y de negocio |
| `backend/src/metrics/metrics.controller.ts` | Expone endpoint `/api/metrics` |
| `backend/src/metrics/http-metrics.interceptor.ts` | Interceptor que mide cada request |
| `monitoring/docker-compose.monitoring.yml` | Stack: Prometheus + Grafana + Loki + Promtail + SonarQube |
| `monitoring/prometheus/prometheus.yml` | Configuracion de scraping |
| `monitoring/prometheus/alert-rules.yml` | 3 reglas de alerta |
| `monitoring/loki/loki-config.yml` | Configuracion de agregacion de logs |
| `monitoring/promtail/promtail-config.yml` | Recolector de logs Docker |
| `monitoring/grafana/provisioning/` | Auto-configuracion de datasources |
| `monitoring/grafana/dashboards/infrastructure.json` | Dashboard de infraestructura |
| `monitoring/grafana/dashboards/business.json` | Dashboard de negocio (pagos) |

#### 4a.1 Instalar la dependencia de metricas

```bash
cd backend
pnpm install
```

Esto instala `prom-client`, la libreria oficial de Prometheus para Node.js.

#### 4a.2 Metricas expuestas por el backend

| Metrica | Tipo | Descripcion |
|---------|------|-------------|
| `http_request_duration_seconds` | Histogram | Latencia de cada request HTTP |
| `http_requests_total` | Counter | Total de requests (method, route, status) |
| `http_errors_total` | Counter | Errores HTTP 4xx y 5xx |
| `payment_processing_duration_seconds` | Histogram | Tiempo de procesamiento de pagos |
| `payments_total` | Counter | Numero de pagos procesados |
| `payments_amount_quetzales` | Gauge | Monto total procesado en Quetzales |

Pueden ver las metricas en crudo en: **http://localhost:3000/api/metrics**

#### 4a.3 Levantar el stack de monitoreo

```bash
# 1. Asegurarse de que la app principal esta corriendo
docker compose up -d

# 2. Levantar el stack de monitoreo
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

#### 4a.4 Acceder a Grafana

1. Abrir **http://localhost:3001**
2. Login: `admin` / `admin` (se puede omitir el cambio de password)
3. Ir a **Dashboards** > **Banco App**
4. Veran 2 dashboards pre-configurados:

**Dashboard de Infraestructura:**
- Request Rate (peticiones por segundo)
- Error Rate (porcentaje de errores)
- Response Time (latencia p50, p95, p99)
- HTTP Status Codes (distribucion)
- CPU y Memoria del proceso Node.js

**Dashboard de Negocio:**
- Pagos procesados (total)
- Monto total en Quetzales
- Pagos por minuto
- Latencia de pagos (p50, p95)
- Tasa de error
- Requests por endpoint

#### 4a.5 Consultar logs en Grafana (Loki)

1. En Grafana, ir a **Explore** (icono de brujula)
2. Seleccionar **Loki** como datasource
3. Usar la query: `{container="banco-modulo-pago-servicios-backend-1"}`
4. Veran los logs del backend en tiempo real, sin necesidad de acceder a la terminal

#### 4a.6 Alertas configuradas

En `monitoring/prometheus/alert-rules.yml` hay 3 alertas:

| Alerta | Condicion | Severidad |
|--------|-----------|-----------|
| `HighErrorRate` | Tasa de errores HTTP > 5% en 5 minutos | Warning |
| `BackendDown` | Backend no responde por mas de 1 minuto | Critical |
| `SlowPayments` | Latencia p95 de pagos > 5 segundos | Warning |

Para ver el estado de las alertas: **http://localhost:9090/alerts**

#### 4a.7 Verificar que Prometheus esta scrapeando

1. Ir a **http://localhost:9090/targets**
2. Verificar que el target `backend` este en estado **UP**
3. Probar una query en **http://localhost:9090/graph**:
   ```
   rate(http_requests_total[5m])
   ```

---

### 4b. Seguridad Integrada (DevSecOps)

**Objetivo:** Automatizar escaneos de seguridad para detectar vulnerabilidades.

#### 4b.1 Trivy (escaneo de imagenes Docker) - Automatico en CI

Trivy ya esta integrado en el pipeline CI (`.github/workflows/ci.yml`). Cada vez que se hace push o se abre un PR:

1. Se construyen las imagenes Docker
2. Trivy escanea cada imagen buscando CVEs
3. **Si hay vulnerabilidades CRITICAL, el pipeline falla** y no se puede mergear

No necesitan hacer nada adicional. Para ejecutar Trivy localmente:

```bash
# Instalar Trivy
# Linux:
sudo apt-get install -y trivy
# macOS:
brew install trivy

# Escanear las imagenes locales
docker compose build
trivy image banco-modulo-pago-servicios-backend
trivy image banco-modulo-pago-servicios-frontend

# Solo mostrar vulnerabilidades CRITICAL y HIGH
trivy image --severity HIGH,CRITICAL banco-modulo-pago-servicios-backend
```

#### 4b.2 npm audit (dependencias vulnerables) - Automatico en CI

Tambien esta integrado en CI. Para ejecutarlo localmente:

```bash
# Backend
cd backend && pnpm audit --prod

# Frontend
cd frontend && pnpm audit --prod
```

#### 4b.3 SonarQube (analisis de calidad y seguridad del codigo)

SonarQube analiza el codigo buscando: bugs, code smells, vulnerabilidades y codigo duplicado.

```bash
# 1. Levantar SonarQube (si no esta corriendo)
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d sonarqube

# 2. Esperar ~2 minutos a que SonarQube inicie completamente
#    Verificar en http://localhost:9000 (la primera vez tarda mas)

# 3. Login en SonarQube
#    Usuario: admin
#    Password: admin
#    (Pedira cambiar la password, pueden poner: admin1234)

# 4. Crear un token:
#    - Ir a My Account > Security > Generate Token
#    - Nombre: "banco-scanner"
#    - Tipo: Global Analysis Token
#    - Copiar el token generado

# 5. Ejecutar el scanner (desde la raiz del proyecto)
cd ..  # volver a la raiz
docker run --rm \
  --network banco-modulo-pago-servicios_banco-network \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token=<PEGAR-TOKEN-AQUI>

# 6. Ver el reporte en http://localhost:9000/projects
```

La configuracion del scanner esta en `sonar-project.properties` en la raiz del proyecto.

#### 4b.4 OWASP ZAP (escaneo DAST contra la API)

OWASP ZAP hace un escaneo de seguridad contra la API **en ejecucion** (pruebas DAST).

```bash
# 1. Asegurarse de que el backend esta corriendo
docker compose up -d

# 2. Ejecutar el escaneo
chmod +x scripts/owasp-zap-scan.sh
./scripts/owasp-zap-scan.sh

# 3. El reporte se genera en: ./zap-report.html
#    Abrir en el navegador para ver los hallazgos
```

El escaneo tarda unos minutos. El reporte HTML muestra:
- Alertas de seguridad categorizadas por riesgo (High, Medium, Low, Informational)
- Descripcion del problema y como solucionarlo
- URLs afectadas

---

## Referencia rapida de puertos

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|-------------|
| Frontend (Nginx) | 8080 | http://localhost:8080 | - |
| Backend (NestJS) | 3000 | http://localhost:3000/api | - |
| PostgreSQL | 5432 | - | root / root |
| pgAdmin | 5050 | http://localhost:5050 | admin@admin.com / admin |
| Prometheus | 9090 | http://localhost:9090 | - |
| Grafana | 3001 | http://localhost:3001 | admin / admin |
| Loki | 3100 | http://localhost:3100 | - |
| SonarQube | 9000 | http://localhost:9000 | admin / admin |

---

## Estructura de archivos DevOps

```
banco-modulo-pago-servicios/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Pipeline CI (lint, test, build, Trivy)
│       └── cd.yml                          # Pipeline CD (push a ghcr.io)
├── backend/
│   ├── Dockerfile                          # Multi-stage build NestJS
│   ├── entrypoint.sh                       # Migraciones auto + startup
│   ├── .dockerignore                       # Exclusiones del build
│   ├── .env.example                        # Variables documentadas
│   └── src/metrics/                        # Metricas Prometheus
│       ├── metrics.module.ts
│       ├── metrics.service.ts
│       ├── metrics.controller.ts
│       └── http-metrics.interceptor.ts
├── frontend/
│   ├── Dockerfile                          # Multi-stage build Vite + Nginx
│   ├── nginx.conf                          # Proxy reverso + SPA
│   └── .dockerignore                       # Exclusiones del build
├── helm/
│   └── banco-app/                          # Helm Chart completo
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── _helpers.tpl
│           ├── NOTES.txt
│           ├── configmap.yaml
│           ├── secret.yaml
│           ├── postgres-statefulset.yaml
│           ├── postgres-service.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── backend-hpa.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           └── ingress.yaml
├── monitoring/
│   ├── docker-compose.monitoring.yml       # Stack de monitoreo completo
│   ├── prometheus/
│   │   ├── prometheus.yml                  # Scrape config
│   │   └── alert-rules.yml                 # Reglas de alerta
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── datasources/datasources.yml
│   │   │   └── dashboards/dashboards.yml
│   │   └── dashboards/
│   │       ├── infrastructure.json         # Dashboard de infra
│   │       └── business.json               # Dashboard de negocio
│   ├── loki/
│   │   └── loki-config.yml                 # Config de agregacion de logs
│   └── promtail/
│       └── promtail-config.yml             # Recolector de logs
├── scripts/
│   └── owasp-zap-scan.sh                   # Escaneo DAST
├── docker-compose.yml                      # Orquestacion principal
└── sonar-project.properties                # Config SonarQube
```

---

## Troubleshooting

### Docker

**"Port already in use"**
```bash
# Ver que proceso usa el puerto
lsof -i :3000
# Detener contenedores previos
docker compose down
```

**"No space left on device"**
```bash
# Limpiar imagenes y contenedores sin uso
docker system prune -a
```

**El backend no conecta a PostgreSQL**
```bash
# Verificar que postgres esta healthy
docker compose ps
# Ver logs de postgres
docker compose logs postgres
```

### Kubernetes / Minikube

**"ImagePullBackOff" o "ErrImageNeverPull"**
```bash
# Asegurarse de construir las imagenes en el Docker de Minikube
eval $(minikube docker-env)
docker build -t banco-backend:latest ./backend
docker build -t banco-frontend:latest ./frontend
```

**Pod en "CrashLoopBackOff"**
```bash
# Ver logs del pod
kubectl logs <nombre-del-pod> --previous
# Describir el pod para ver eventos
kubectl describe pod <nombre-del-pod>
```

**Ingress no funciona**
```bash
# Verificar que el addon esta habilitado
minikube addons enable ingress
# Verificar que el ingress controller esta corriendo
kubectl get pods -n ingress-nginx
```

### Monitoreo

**Grafana no muestra datos**
1. Verificar que Prometheus esta scrapeando: http://localhost:9090/targets
2. Verificar que el backend expone metricas: http://localhost:3000/api/metrics
3. En Grafana, ir a Connections > Data Sources > Prometheus > Test

**SonarQube no inicia**
```bash
# SonarQube necesita este setting en Linux (WSL incluido)
sudo sysctl -w vm.max_map_count=524288

# Para hacerlo permanente, agregar a /etc/sysctl.conf:
# vm.max_map_count=524288
```
