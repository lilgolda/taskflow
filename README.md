# TaskFlow

[![CI](https://github.com/lilgolda/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/lilgolda/taskflow/actions/workflows/ci.yml)
[![CD](https://github.com/lilgolda/taskflow/actions/workflows/cd.yml/badge.svg)](https://github.com/lilgolda/taskflow/actions/workflows/cd.yml)

Gestor de tareas por equipos: **React (Vite) + Node.js (Express) + MongoDB**, contenerizado con Docker Compose.

La API es la del proyecto final del módulo anterior (usuarios, equipos y tareas). Su documentación completa (endpoints, filtros, aggregation pipeline, errores) está en [`api/README.md`](api/README.md).

| Servicio | Build / imagen | Puerto en el host | Descripción |
|---|---|---|---|
| `web` | `web/Dockerfile` (Node → Nginx) | **8080** → 80 | Frontend React servido por Nginx |
| `api` | `api/Dockerfile` (Node 22 Alpine) | **3000** → 3000 | API REST (`/api/tasks`, `/api/teams`, `/api/users`) |
| `mongo` | `mongo:7` | no se publica | Base de datos, solo accesible en la red interna |

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS) o Docker Engine + plugin Compose (Linux).
- Docker Compose v2 (`docker compose version`).
- Git.
- Puertos **8080** y **3000** libres.

## Levantar el proyecto desde cero

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio> taskflow
cd taskflow

# 2. Crear el archivo de variables a partir de la plantilla
cp .env.example .env          # PowerShell: Copy-Item .env.example .env

# 3. (Opcional) Editar .env y cambiar el usuario y la contraseña de Mongo.
#    Los valores de ejemplo ya permiten arrancar en local.

# 4. Construir y levantar los tres servicios
docker compose up -d --build

# 5. Comprobar el estado (mongo y api deben aparecer como "healthy")
docker compose ps
```

Orden de arranque: `mongo` (healthy) → `api` (healthy) → `web`.

## Cómo probarlo

1. Abre http://localhost:8080
2. Ve a **Equipos** y crea un equipo (en la API toda tarea pertenece a un equipo).
3. Vuelve a **Tareas** y crea una tarea. Puedes cambiar su estado, filtrar por equipo/estado o abrir su detalle.

| Qué | URL |
|---|---|
| Aplicación | http://localhost:8080 |
| Ruta interna de React (prueba de `try_files`) | http://localhost:8080/teams (recarga con F5) |
| API: comprobación | http://localhost:3000/ |
| API: tareas (JSON) | http://localhost:3000/api/tasks |
| API: equipos (JSON) | http://localhost:3000/api/teams |

## Detener y borrar datos

```bash
# Ver logs (todos o de un servicio)
docker compose logs -f
docker compose logs -f api

# Detener los contenedores (los datos se conservan en el volumen)
docker compose stop

# Detener y eliminar contenedores y red (los datos se conservan)
docker compose down

# Detener y BORRAR TAMBIÉN LOS DATOS (elimina el volumen mongo-data)
docker compose down -v
```

> Si cambias `MONGO_ROOT_USER` o `MONGO_ROOT_PASSWORD` después del primer arranque, ejecuta
> `docker compose down -v` para que Mongo vuelva a crear el usuario con los nuevos valores.
>
> Si cambias `VITE_API_URL`, reconstruye el frontend: `docker compose up -d --build web`.

## Variables de entorno (`.env`)

| Variable | Uso |
|---|---|
| `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` | Usuario administrador que crea Mongo; la API los usa para armar `MONGODB_URI` |
| `MONGO_DB` | Nombre de la base de datos (llega a la API como `DB_NAME`) |
| `MAX_POOL_SIZE` | Pool de conexiones de Mongoose |
| `VITE_API_URL` | URL de la API que usa el navegador; se pasa como `ARG` al build del frontend |

## Pipeline CI/CD (GitHub Actions)

### En cada pull request hacia `main` — [`ci.yml`](.github/workflows/ci.yml)

| Job | Qué hace |
|---|---|
| `api` | `npm ci` → `npm run lint` (ESLint) → `npm test` (Jest + Supertest) en `api/` |
| `web` | `npm ci` → `npm run lint` (ESLint) → `npm test` (Vitest + Testing Library) → `npm run build` en `web/` |
| `docker` | Cuando `api` y `web` pasan (`needs`), construye las imágenes con `docker compose build` |

Los tres jobs usan Node 22 con caché de npm. El mismo workflow corre también en cada push a `main`.

`main` está protegida: no se puede hacer push directo ni force push, todo entra por pull request y el merge solo se habilita cuando `api`, `web` y `docker` están en verde.

### Al hacer merge a `main` o crear un tag — [`cd.yml`](.github/workflows/cd.yml)

Una matriz construye y publica las dos imágenes en GitHub Container Registry, con caché de capas de Buildx (`type=gha`):

- `ghcr.io/lilgolda/taskflow-api`
- `ghcr.io/lilgolda/taskflow-web`

| Evento | Tags publicados |
|---|---|
| Merge a `main` | `sha-<commit>` y `latest` |
| Tag de Git `v1.0.0` | `1.0.0`, `1.0` y `sha-<commit>` |

Para publicar una versión:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Para usar las imágenes publicadas:

```bash
docker pull ghcr.io/lilgolda/taskflow-api:latest
docker pull ghcr.io/lilgolda/taskflow-web:1.0.0
```

### Secrets y variables

| Nombre | Tipo | Uso |
|---|---|---|
| `GITHUB_TOKEN` | Secret automático de GitHub | Login en GHCR desde `cd.yml`. No hay tokens personales en el repositorio |
| `VITE_API_URL` | Variable del repositorio (`vars.VITE_API_URL`) | URL de la API que se inyecta al compilar el frontend, en CI y en CD |

Se configuran en **Settings › Secrets and variables › Actions**. Ningún valor sensible está escrito en los workflows ni se imprime en los logs.

### Ejecutar las comprobaciones en local

```bash
cd api && npm ci && npm run lint && npm test
cd web && npm ci && npm run lint && npm test && npm run build
```

## Estructura

```
taskflow/
├── api/                  API Express + Mongoose
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js, app.js
│   └── config/ controllers/ middleware/ models/ routes/ utils/
├── web/                  Frontend React (Vite + React Router)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── src/
├── .github/workflows/   ci.yml y cd.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Desarrollo sin Docker

La API se puede seguir ejecutando como en el módulo anterior (con MongoDB Atlas o un Mongo local), usando `api/.env.example`:

```bash
cd api && npm install && npm run dev         # http://localhost:3000
cd web && npm install && npm run dev         # http://localhost:5173
```
