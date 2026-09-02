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
        startsAt: dateFromNow(10),
        durationMin: 120,
        capacity: 5,
        location: "Sala pública",
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina encerrada ${marker}`,
        category: "Outros",
        description: "Oficina passada que não deve aparecer na listagem pública.",
        startsAt: dateFromNow(-10),
        durationMin: 120,
        capacity: 5,
        location: "Sala antiga",
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina inativa ${marker}`,
        category: "Outros",
        description: "Oficina inativa que não deve aparecer na listagem pública.",
        startsAt: dateFromNow(20),
        durationMin: 120,
        capacity: 5,
        location: "Sala inativa",
        active: false,
      },
    }),
  ]);

  availableWorkshopId = availableWorkshop.id;
  pastWorkshopId = pastWorkshop.id;
  inactiveWorkshopId = inactiveWorkshop.id;
  workshopIds.push(availableWorkshopId, pastWorkshopId, inactiveWorkshopId);

  await prisma.enrollment.createMany({
    data: [
      {
        name: "Pessoa Pendente",
        email: `pending-${marker}@example.com`,
        workshopId: availableWorkshopId,
      },
      {
        name: "Pessoa Confirmada",
        email: `confirmed-${marker}@example.com`,
        status: EnrollmentStatus.CONFIRMADA,
        workshopId: availableWorkshopId,
      },
      {
        name: "Pessoa Cancelada",
        email: `canceled-${marker}@example.com`,
        status: EnrollmentStatus.CANCELADA,
        workshopId: availableWorkshopId,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId: { in: workshopIds } } });
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

    const dates = response.body.data.map((workshop: { startsAt: string }) =>
      new Date(workshop.startsAt).getTime(),
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
      capacity: 5,
      availableSeats: 3,
    });
    expect(workshop._count).toBeUndefined();
  });

  it("returns the calculated seats in the public workshop detail", async () => {
    const response = await request(app).get(`/api/oficinas/${availableWorkshopId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.availableSeats).toBe(3);
  });

  it("does not expose a past workshop by id", async () => {
    const response = await request(app).get(`/api/oficinas/${pastWorkshopId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("WORKSHOP_NOT_FOUND");
  });
});
