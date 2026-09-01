import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_EXPIRES_SECONDS: z.coerce.number().int().positive().default(7_200),
  AUTH_COOKIE_NAME: z.string().min(1).default("feito_a_mao_session"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  ADMIN_NAME: z.string().min(3).default("Administrador"),
  ADMIN_EMAIL: z.string().email().default("admin@feitoamao.local"),
  ADMIN_PASSWORD: z.string().min(8),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  console.error("Variáveis de ambiente inválidas:", result.error.flatten().fieldErrors);
  throw new Error("Configuração de ambiente inválida");
}

export const env = result.data;
