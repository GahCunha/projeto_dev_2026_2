import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const marker = randomUUID();
const workshopIds: string[] = [];
let availableWorkshopId: string;
let pastWorkshopId: string;
let inactiveWorkshopId: string;
let availableClassId: string;

function dateFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

beforeAll(async () => {
  const [availableWorkshop, pastWorkshop, inactiveWorkshop] = await Promise.all([
    prisma.workshop.create({
      data: {
        title: `Bordado público ${marker}`,
        category: "Bordado",
        description: "Oficina futura criada para testar a listagem pública.",
        imageUrl: "https://example.com/bordado.jpg",
        materials: ["Bastidor", "Agulha", "Linha"],
        classes: {
          create: {
            name: "Turma futura",
            capacity: 5,
            price: 85.5,
            meetings: { create: { startsAt: dateFromNow(10), endsAt: dateFromNow(10.1), location: "Sala pública" } },
          },
        },
      },
      include: { classes: true },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina encerrada ${marker}`,
        category: "Outros",
        description: "Oficina passada que não deve aparecer na listagem pública.",
        classes: {
          create: {
            name: "Turma encerrada",
            capacity: 5,
            meetings: { create: { startsAt: dateFromNow(-10), endsAt: dateFromNow(-9.9), location: "Sala antiga" } },
          },
        },
      },
      include: { classes: true },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina inativa ${marker}`,
        category: "Outros",
        description: "Oficina inativa que não deve aparecer na listagem pública.",
        active: false,
        classes: {
          create: {
            name: "Turma inativa",
            capacity: 5,
            meetings: { create: { startsAt: dateFromNow(20), endsAt: dateFromNow(20.1), location: "Sala inativa" } },
          },
        },
      },
      include: { classes: true },
    }),
  ]);

  availableWorkshopId = availableWorkshop.id;
  pastWorkshopId = pastWorkshop.id;
  inactiveWorkshopId = inactiveWorkshop.id;
  availableClassId = availableWorkshop.classes[0]!.id;
  workshopIds.push(availableWorkshopId, pastWorkshopId, inactiveWorkshopId);

  await prisma.enrollment.createMany({
    data: [
      {
        name: "Pessoa Pendente",
        email: `pending-${marker}@example.com`,
        classId: availableClassId,
      },
      {
        name: "Pessoa Confirmada",
        email: `confirmed-${marker}@example.com`,
        status: EnrollmentStatus.CONFIRMADA,
        classId: availableClassId,
      },
      {
        name: "Pessoa Cancelada",
        email: `canceled-${marker}@example.com`,
        status: EnrollmentStatus.CANCELADA,
        classId: availableClassId,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { class: { workshopId: { in: workshopIds } } } });
  await prisma.workshop.deleteMany({ where: { id: { in: workshopIds } } });
  await prisma.$disconnect();
});

describe("public workshops", () => {
  it("lists only active future workshops and orders them by date", async () => {
    const response = await request(app).get("/api/oficinas");

    expect(response.status).toBe(200);
    const ids = response.body.data.map((workshop: { id: string }) => workshop.id);
    expect(ids).toContain(availableWorkshopId);
    expect(ids).not.toContain(pastWorkshopId);
    expect(ids).not.toContain(inactiveWorkshopId);

    const dates = response.body.data.map((workshop: { nextMeetingAt: string }) =>
      new Date(workshop.nextMeetingAt).getTime(),
    );
    expect(dates).toEqual([...dates].sort((first, second) => first - second));
  });

  it("returns category, cover, materials and calculated available seats", async () => {
    const response = await request(app).get("/api/oficinas");
    const workshop = response.body.data.find(
      (item: { id: string }) => item.id === availableWorkshopId,
    );

    expect(workshop).toMatchObject({
      category: "Bordado",
      imageUrl: "https://example.com/bordado.jpg",
      materials: ["Bastidor", "Agulha", "Linha"],
      totalCapacity: 5,
      classCount: 1,
      availableSeats: 3,
      minimumPrice: 85.5,
      maximumPrice: 85.5,
    });
    expect(workshop._count).toBeUndefined();
  });

  it("returns the calculated seats in the public workshop detail", async () => {
    const response = await request(app).get(`/api/oficinas/${availableWorkshopId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.availableSeats).toBe(3);
    expect(response.body.data).not.toHaveProperty("startsAt");
    expect(response.body.data).not.toHaveProperty("capacity");
  });

  it("does not expose a past workshop by id", async () => {
    const response = await request(app).get(`/api/oficinas/${pastWorkshopId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("WORKSHOP_NOT_FOUND");
  });
});
