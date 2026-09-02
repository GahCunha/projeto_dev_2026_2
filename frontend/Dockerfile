FROM node:22-alpine AS build

WORKDIR /aplicacao

COPY package*.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY src ./src

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /aplicacao/dist /usr/share/nginx/html

EXPOSE 80
