import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const workshopIds: string[] = [];
let availableWorkshopId: string;
let inactiveWorkshopId: string;
let fullWorkshopId: string;

function futureDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date;
}

beforeAll(async () => {
  const suffix = randomUUID();

  const [availableWorkshop, inactiveWorkshop, fullWorkshop] = await Promise.all([
    prisma.workshop.create({
      data: {
        title: `Oficina disponível ${suffix}`,
        description: "Oficina criada exclusivamente para os testes automatizados.",
        startsAt: futureDate(),
        durationMin: 120,
        capacity: 20,
        location: "Sala de testes",
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina inativa ${suffix}`,
        description: "Oficina inativa criada exclusivamente para os testes.",
        startsAt: futureDate(),
        durationMin: 120,
        capacity: 20,
        location: "Sala de testes",
        active: false,
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina lotada ${suffix}`,
        description: "Oficina lotada criada exclusivamente para os testes.",
        startsAt: futureDate(),
        durationMin: 120,
        capacity: 1,
        location: "Sala de testes",
      },
    }),
  ]);

  availableWorkshopId = availableWorkshop.id;
  inactiveWorkshopId = inactiveWorkshop.id;
  fullWorkshopId = fullWorkshop.id;
  workshopIds.push(availableWorkshopId, inactiveWorkshopId, fullWorkshopId);
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId: { in: workshopIds } } });
  await prisma.workshop.deleteMany({ where: { id: { in: workshopIds } } });
  await prisma.$disconnect();
});

describe("POST /api/inscricoes", () => {
  it("creates a pending enrollment with valid data", async () => {
    const email = `valid-${randomUUID()}@example.com`;

    const response = await request(app).post("/api/inscricoes").send({
      name: "Maria Artesã",
      email,
      workshopId: availableWorkshopId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: "Maria Artesã",
      email,
      workshopId: availableWorkshopId,
      status: EnrollmentStatus.PENDENTE,
    });

    const persistedEnrollment = await prisma.enrollment.findUnique({
      where: {
        email_workshopId: { email, workshopId: availableWorkshopId },
      },
    });

    expect(persistedEnrollment).not.toBeNull();
  });

  it("rejects invalid data without persisting it", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "M",
      email: "email-invalido",
      workshopId: availableWorkshopId,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
  });

  it("rejects an enrollment for an inactive workshop", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "João Artesão",
      email: `inactive-${randomUUID()}@example.com`,
      workshopId: inactiveWorkshopId,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("WORKSHOP_UNAVAILABLE");
  });

  it("rejects a duplicate enrollment", async () => {
    const data = {
      name: "Ana Artesã",
      email: `duplicate-${randomUUID()}@example.com`,
      workshopId: availableWorkshopId,
    };

    expect((await request(app).post("/api/inscricoes").send(data)).status).toBe(201);

    const duplicateResponse = await request(app).post("/api/inscricoes").send(data);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error).toBe("ENROLLMENT_ALREADY_EXISTS");
  });

  it("rejects an enrollment when the workshop is full", async () => {
    const firstResponse = await request(app).post("/api/inscricoes").send({
      name: "Primeira Pessoa",
      email: `first-${randomUUID()}@example.com`,
      workshopId: fullWorkshopId,
    });

    expect(firstResponse.status).toBe(201);

    const fullResponse = await request(app).post("/api/inscricoes").send({
      name: "Segunda Pessoa",
      email: `second-${randomUUID()}@example.com`,
      workshopId: fullWorkshopId,
    });

    expect(fullResponse.status).toBe(409);
    expect(fullResponse.body.error).toBe("WORKSHOP_FULL");
  });
});
