import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const password = "SenhaSegura@123";
const email = `admin-${randomUUID()}@example.com`;
let userId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      name: "Admin de Teste",
      email,
      passwordHash: await hash(password, 4),
    },
  });

  userId = user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});

describe("admin authentication", () => {
  it("blocks a protected route without authentication", async () => {
    const response = await request(app).get("/api/admin/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid credentials", async () => {
    const response = await request(app).post("/api/admin/auth/login").send({
      email,
      password: "senha-incorreta",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("logs in, accesses the protected route and logs out", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent.post("/api/admin/auth/login").send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data).toEqual({
      id: userId,
      name: "Admin de Teste",
      email,
    });
    expect(loginResponse.headers["set-cookie"]?.[0]).toContain("HttpOnly");

    const authenticatedResponse = await agent.get("/api/admin/auth/me");

    expect(authenticatedResponse.status).toBe(200);
    expect(authenticatedResponse.body.data.email).toBe(email);

    const logoutResponse = await agent.post("/api/admin/auth/logout");

    expect(logoutResponse.status).toBe(204);
    expect((await agent.get("/api/admin/auth/me")).status).toBe(401);
  });
});
