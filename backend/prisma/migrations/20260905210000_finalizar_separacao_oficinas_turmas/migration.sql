DROP INDEX "oficinas_ativa_data_inicio_idx";

ALTER TABLE "inscricoes"
DROP CONSTRAINT "inscricoes_oficina_id_fkey",
DROP CONSTRAINT "inscricoes_turma_id_fkey";

ALTER TABLE "inscricoes"
ALTER COLUMN "turma_id" SET NOT NULL,
DROP COLUMN "oficina_id";

ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_turma_id_fkey"
FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "oficinas"
DROP COLUMN "data_inicio",
DROP COLUMN "duracao_min",
DROP COLUMN "vagas",
DROP COLUMN "local";

CREATE INDEX "oficinas_ativa_idx" ON "oficinas"("ativa");
