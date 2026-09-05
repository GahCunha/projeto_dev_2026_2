import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { emailService } from "../../src/shared/email/email.service.js";

const workshopIds: string[] = [];
let availableWorkshopId: string;
let inactiveWorkshopId: string;
let fullWorkshopId: string;
let concurrentWorkshopId: string;
let availableClassId: string;
let inactiveClassId: string;
let fullClassId: string;
let concurrentClassId: string;

function futureDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date;
}

beforeAll(async () => {
  const suffix = randomUUID();

  const [availableWorkshop, inactiveWorkshop, fullWorkshop, concurrentWorkshop] = await Promise.all([
    prisma.workshop.create({
      data: {
        title: `Oficina disponível ${suffix}`,
        description: "Oficina criada exclusivamente para os testes automatizados.",
        classes: { create: { name: "Turma", capacity: 20, meetings: { create: { startsAt: futureDate(), endsAt: new Date(futureDate().getTime() + 7_200_000), location: "Sala de testes" } } } },
      },
      include: { classes: true },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina inativa ${suffix}`,
        description: "Oficina inativa criada exclusivamente para os testes.",
        active: false,
        classes: { create: { name: "Turma", capacity: 20, meetings: { create: { startsAt: futureDate(), endsAt: new Date(futureDate().getTime() + 7_200_000), location: "Sala de testes" } } } },
      },
      include: { classes: true },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina lotada ${suffix}`,
        description: "Oficina lotada criada exclusivamente para os testes.",
        classes: { create: { name: "Turma", capacity: 1, meetings: { create: { startsAt: futureDate(), endsAt: new Date(futureDate().getTime() + 7_200_000), location: "Sala de testes" } } } },
      },
      include: { classes: true },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina concorrida ${suffix}`,
        description: "Oficina criada para testar duas inscrições simultâneas.",
        classes: { create: { name: "Turma", capacity: 1, meetings: { create: { startsAt: futureDate(), endsAt: new Date(futureDate().getTime() + 7_200_000), location: "Sala de testes" } } } },
      },
      include: { classes: true },
    }),
  ]);

  availableWorkshopId = availableWorkshop.id;
  inactiveWorkshopId = inactiveWorkshop.id;
  fullWorkshopId = fullWorkshop.id;
  concurrentWorkshopId = concurrentWorkshop.id;
  availableClassId = availableWorkshop.classes[0]!.id;
  inactiveClassId = inactiveWorkshop.classes[0]!.id;
  fullClassId = fullWorkshop.classes[0]!.id;
  concurrentClassId = concurrentWorkshop.classes[0]!.id;
  workshopIds.push(availableWorkshopId, inactiveWorkshopId, fullWorkshopId, concurrentWorkshopId);
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { class: { workshopId: { in: workshopIds } } } });
  await prisma.workshop.deleteMany({ where: { id: { in: workshopIds } } });
  await prisma.$disconnect();
});

describe("POST /api/inscricoes", () => {
  it("creates a pending enrollment with valid data", async () => {
    const email = `valid-${randomUUID()}@example.com`;
    const emailSpy = vi.spyOn(emailService, "sendEnrollmentReceived");

    const response = await request(app).post("/api/inscricoes").send({
      name: "Maria Artesã",
      email,
      classId: availableClassId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: "Maria Artesã",
      email,
      classId: availableClassId,
      status: EnrollmentStatus.PENDENTE,
    });

    const persistedEnrollment = await prisma.enrollment.findFirst({
      where: { email, classId: availableClassId },
    });

    expect(persistedEnrollment).not.toBeNull();
    expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: "Maria Artesã",
      email,
      workshop: expect.objectContaining({ title: expect.any(String) }),
    }));
    emailSpy.mockRestore();
  });

  it("rejects invalid data without persisting it", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "M",
      email: "email-invalido",
      classId: availableClassId,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
  });

  it("requires a class and no longer accepts enrollment directly in a workshop", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "Pessoa sem turma",
      email: `legacy-${randomUUID()}@example.com`,
      workshopId: availableWorkshopId,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
    expect(response.body.fields.classId).toBeDefined();
  });

  it("rejects an enrollment for an inactive workshop", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "João Artesão",
      email: `inactive-${randomUUID()}@example.com`,
      classId: inactiveClassId,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("CLASS_UNAVAILABLE");
  });

  it("rejects a duplicate enrollment", async () => {
    const data = {
      name: "Ana Artesã",
      email: `duplicate-${randomUUID()}@example.com`,
      classId: availableClassId,
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
      classId: fullClassId,
    });

    expect(firstResponse.status).toBe(201);

    const fullResponse = await request(app).post("/api/inscricoes").send({
      name: "Segunda Pessoa",
      email: `second-${randomUUID()}@example.com`,
      classId: fullClassId,
    });

    expect(fullResponse.status).toBe(409);
    expect(fullResponse.body.error).toBe("CLASS_FULL");
  });

  it("allows only one enrollment to take the last seat under concurrent requests", async () => {
    const [firstResponse, secondResponse] = await Promise.all([
      request(app).post("/api/inscricoes").send({
        name: "Pessoa Concorrente Um",
        email: `concurrent-1-${randomUUID()}@example.com`,
        classId: concurrentClassId,
      }),
      request(app).post("/api/inscricoes").send({
        name: "Pessoa Concorrente Dois",
        email: `concurrent-2-${randomUUID()}@example.com`,
        classId: concurrentClassId,
      }),
    ]);

    expect([firstResponse.status, secondResponse.status].sort()).toEqual([201, 409]);
    expect([firstResponse.body.error, secondResponse.body.error]).toContain("CLASS_FULL");

    const occupiedSeats = await prisma.enrollment.count({
      where: {
        classId: concurrentClassId,
        status: { not: EnrollmentStatus.CANCELADA },
      },
    });
    expect(occupiedSeats).toBe(1);
  });
});
