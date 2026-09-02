import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const marker = randomUUID();
const adminEmail = `list-admin-${marker}@example.com`;
const adminPassword = "SenhaSegura@123";
const workshopIds: string[] = [];
let adminId: string;
let firstWorkshopId: string;
let secondWorkshopId: string;

function futureDate(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

beforeAll(async () => {
  const [admin, firstWorkshop, secondWorkshop] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin da Listagem",
        email: adminEmail,
        passwordHash: await hash(adminPassword, 4),
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Primeira oficina ${marker}`,
        description: "Oficina criada para testar a listagem administrativa.",
        startsAt: futureDate(10),
        durationMin: 120,
        capacity: 20,
        location: "Sala de testes",
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Segunda oficina ${marker}`,
        description: "Oficina criada para testar a listagem administrativa.",
        startsAt: futureDate(20),
        durationMin: 120,
        capacity: 20,
        location: "Sala de testes",
      },
    }),
  ]);

  adminId = admin.id;
  firstWorkshopId = firstWorkshop.id;
  secondWorkshopId = secondWorkshop.id;
  workshopIds.push(firstWorkshopId, secondWorkshopId);

  await prisma.enrollment.createMany({
    data: [
      {
        name: `Busca Especial ${marker}`,
        email: `${marker}-1@example.com`,
        status: EnrollmentStatus.PENDENTE,
        workshopId: firstWorkshopId,
      },
      {
        name: `Pessoa Confirmada ${marker}`,
        email: `${marker}-2@example.com`,
        status: EnrollmentStatus.CONFIRMADA,
        workshopId: secondWorkshopId,
      },
      {
        name: `Pessoa Cancelada ${marker}`,
        email: `${marker}-3@example.com`,
        status: EnrollmentStatus.CANCELADA,
        workshopId: firstWorkshopId,
      },
      {
        name: `Outra Pessoa ${marker}`,
        email: `${marker}-4@example.com`,
        status: EnrollmentStatus.PENDENTE,
        workshopId: secondWorkshopId,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId: { in: workshopIds } } });
  await prisma.workshop.deleteMany({ where: { id: { in: workshopIds } } });
  await prisma.user.deleteMany({ where: { id: adminId } });
  await prisma.$disconnect();
});

async function authenticatedAgent() {
  const agent = request.agent(app);
  const response = await agent.post("/api/admin/auth/login").send({
    email: adminEmail,
    password: adminPassword,
  });

  expect(response.status).toBe(200);
  return agent;
}

describe("GET /api/admin/inscricoes", () => {
  it("blocks access without authentication", async () => {
    const response = await request(app).get("/api/admin/inscricoes");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("paginates enrollments and includes their workshops", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/inscricoes")
      .query({ search: marker, page: 1, pageSize: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 2,
      totalItems: 4,
      totalPages: 2,
    });
    expect(response.body.data[0].workshop).toMatchObject({
      id: firstWorkshopId,
      active: true,
    });
  });

  it("searches by name without case sensitivity", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/inscricoes")
      .query({ search: "BUSCA ESPECIAL" });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe(`Busca Especial ${marker}`);
  });

  it("filters enrollments by status", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/inscricoes")
      .query({ search: marker, status: EnrollmentStatus.PENDENTE });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((item: { status: string }) => item.status === "PENDENTE")).toBe(
      true,
    );
  });

  it("rejects pagination above the allowed limit", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.get("/api/admin/inscricoes").query({ pageSize: 51 });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
  });
});
