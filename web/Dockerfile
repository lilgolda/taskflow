# syntax=docker/dockerfile:1

# ---------- Etapa 1: compilar React con Node ----------
FROM node:22-alpine AS build
WORKDIR /app

# Manifiestos primero para aprovechar la caché de capas.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite sustituye las variables VITE_* durante el build,
# por eso la URL de la API llega como argumento de build.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- Etapa 2: servir los estáticos con Nginx ----------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
