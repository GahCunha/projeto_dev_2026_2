CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "oficina_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "vagas" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "encontros_turma" (
    "id" TEXT NOT NULL,
    "turma_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "encontros_turma_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "inscricoes" ADD COLUMN "turma_id" TEXT;

-- Cada oficina existente passa a ter uma turma inicial. O mesmo UUID é
-- intencional: durante a transição, clientes antigos ainda enviam oficina_id.
INSERT INTO "turmas" (
    "id", "oficina_id", "nome", "vagas", "valor", "ativa", "criado_em", "atualizado_em"
)
SELECT
    "id", "id", 'Turma inicial', "vagas", 0, "ativa", "criado_em", "atualizado_em"
FROM "oficinas";

INSERT INTO "encontros_turma" (
    "id", "turma_id", "data_inicio", "data_fim", "local", "criado_em", "atualizado_em"
)
SELECT
    "id",
    "id",
    "data_inicio",
    "data_inicio" + ("duracao_min" * INTERVAL '1 minute'),
    "local",
    "criado_em",
    "atualizado_em"
FROM "oficinas";

UPDATE "inscricoes" SET "turma_id" = "oficina_id";

CREATE INDEX "turmas_oficina_id_ativa_idx" ON "turmas"("oficina_id", "ativa");
CREATE INDEX "encontros_turma_turma_id_data_inicio_idx" ON "encontros_turma"("turma_id", "data_inicio");
CREATE UNIQUE INDEX "inscricoes_email_turma_id_key" ON "inscricoes"("email", "turma_id");

ALTER TABLE "turmas" ADD CONSTRAINT "turmas_oficina_id_fkey"
FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "encontros_turma" ADD CONSTRAINT "encontros_turma_turma_id_fkey"
FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_turma_id_fkey"
FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
