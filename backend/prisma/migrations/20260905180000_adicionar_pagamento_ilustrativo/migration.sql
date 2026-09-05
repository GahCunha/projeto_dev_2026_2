CREATE TYPE "StatusPagamento" AS ENUM ('ISENTO', 'PENDENTE', 'PAGO');

ALTER TABLE "inscricoes"
ADD COLUMN "status_pagamento" "StatusPagamento" NOT NULL DEFAULT 'ISENTO',
ADD COLUMN "token_pagamento_hash" TEXT,
ADD COLUMN "pago_em" TIMESTAMP(3);

UPDATE "inscricoes" AS "i"
SET "status_pagamento" = CASE
  WHEN "t"."valor" > 0 THEN 'PENDENTE'::"StatusPagamento"
  ELSE 'ISENTO'::"StatusPagamento"
END
FROM "turmas" AS "t"
WHERE "i"."turma_id" = "t"."id";

CREATE UNIQUE INDEX "inscricoes_token_pagamento_hash_key"
ON "inscricoes"("token_pagamento_hash");
