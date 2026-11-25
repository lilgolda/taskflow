# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Se copian primero los manifiestos para aprovechar la caché de capas:
# si solo cambia el código, no se vuelve a ejecutar npm ci.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Etapa 2: imagen final de ejecución ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# Solo lo necesario para ejecutar: node_modules de producción + código.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
# El resto del código (server.js, app.js, config/, models/, routes/...).
# Lo que no debe entrar en la imagen está en .dockerignore.
COPY --chown=node:node . .

# Usuario sin privilegios incluido en la imagen oficial de Node.
USER node

EXPOSE 3000

CMD ["node", "server.js"]
