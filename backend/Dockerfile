FROM node:22-alpine

WORKDIR /aplicacao

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY vitest.config.mts ./
COPY src ./src
COPY tests ./tests

RUN npm run db:generate && npm run build

EXPOSE 3333

CMD ["npm", "run", "iniciar:docker"]
