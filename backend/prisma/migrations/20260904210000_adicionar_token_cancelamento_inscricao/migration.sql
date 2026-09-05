ALTER TABLE "inscricoes" ADD COLUMN "token_cancelamento_hash" TEXT;

CREATE UNIQUE INDEX "inscricoes_token_cancelamento_hash_key"
ON "inscricoes"("token_cancelamento_hash");
