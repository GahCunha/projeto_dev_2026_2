FROM node:22-alpine AS frontend-build

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-build

WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run db:generate && npm run build

FROM node:22-alpine

WORKDIR /aplicacao
ENV NODE_ENV=production
ENV FRONTEND_DIST_PATH=/aplicacao/public

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY --from=backend-build /build/backend/node_modules ./node_modules
COPY --from=backend-build /build/backend/dist ./dist
COPY --from=frontend-build /build/frontend/dist ./public

EXPOSE 3333

CMD ["npm", "run", "iniciar:docker"]
