CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "StatusInscricao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA');

CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "oficinas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "vagas" INTEGER NOT NULL,
    "local" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscricoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "StatusInscricao" NOT NULL DEFAULT 'PENDENTE',
    "oficina_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inscricoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE INDEX "oficinas_ativa_data_inicio_idx" ON "oficinas"("ativa", "data_inicio");
CREATE INDEX "inscricoes_status_criado_em_idx" ON "inscricoes"("status", "criado_em");
CREATE UNIQUE INDEX "inscricoes_email_oficina_id_key" ON "inscricoes"("email", "oficina_id");

ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_oficina_id_fkey"
FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


