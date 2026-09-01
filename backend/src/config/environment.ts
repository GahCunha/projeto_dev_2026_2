import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  console.error("Variáveis de ambiente inválidas:", result.error.flatten().fieldErrors);
  throw new Error("Configuração de ambiente inválida");
}

export const env = result.data;


