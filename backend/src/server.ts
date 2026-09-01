import { app } from "./app.js";
import { env } from "./config/environment.js";
import { prisma } from "./config/database.js";

const server = app.listen(env.PORT, () => {
  console.log(`Feito à Mão disponível em http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} recebido. Encerrando a aplicação...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));


