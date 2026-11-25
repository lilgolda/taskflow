# TaskFlow

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
