import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const marker = randomUUID();
const adminEmail = `workshop-admin-${marker}@example.com`;
const adminPassword = "SenhaSegura@123";
const workshopIds: string[] = [];
let adminId: string;
let managedWorkshopId: string;

function futureDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      name: "Admin das Oficinas",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 4),
    },
  });

  const workshops = await Promise.all([
    prisma.workshop.create({
      data: {
        title: `Cerâmica ${marker}`,
        description: "Oficina ativa criada para testar a gestão administrativa.",
        startsAt: futureDate(10),
        durationMin: 120,
        capacity: 12,
        location: `Ateliê Norte ${marker}`,
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Crochê ${marker}`,
        description: "Oficina inativa criada para testar a gestão administrativa.",
        startsAt: futureDate(20),
        durationMin: 90,
        capacity: 8,
        location: `Ateliê Sul ${marker}`,
        active: false,
      },
    }),
  ]);

  adminId = admin.id;
  workshopIds.push(...workshops.map((workshop) => workshop.id));
  managedWorkshopId = workshops[0].id;

  await prisma.enrollment.createMany({
    data: [
      {
        name: "Pessoa Pendente",
        email: `pending-${marker}@example.com`,
        workshopId: managedWorkshopId,
      },
      {
        name: "Pessoa Confirmada",
        email: `confirmed-${marker}@example.com`,
        status: "CONFIRMADA",
        workshopId: managedWorkshopId,
      },
      {
        name: "Pessoa Cancelada",
        email: `canceled-${marker}@example.com`,
        status: "CANCELADA",
        workshopId: managedWorkshopId,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId: { in: workshopIds } } });
  await prisma.workshop.deleteMany({ where: { id: { in: workshopIds } } });
  await prisma.user.delete({ where: { id: adminId } });
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

describe("administrative workshops", () => {
  it("blocks listing and creation without authentication", async () => {
    const [listResponse, createResponse] = await Promise.all([
      request(app).get("/api/admin/oficinas"),
      request(app).post("/api/admin/oficinas").send({}),
    ]);

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
  });

  it("creates and persists a workshop", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.post("/api/admin/oficinas").send({
      title: `Carpintaria ${marker}`,
      category: "Carpintaria",
      description: "Introdução segura às principais ferramentas de carpintaria.",
      imageUrl: "https://example.com/carpintaria.jpg",
      materials: ["Avental", "Óculos de proteção"],
      startsAt: futureDate(30).toISOString(),
      durationMin: 180,
      capacity: 15,
      location: "Oficina central",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      title: `Carpintaria ${marker}`,
      category: "Carpintaria",
      imageUrl: "https://example.com/carpintaria.jpg",
      materials: ["Avental", "Óculos de proteção"],
      capacity: 15,
      active: true,
    });

    workshopIds.push(response.body.data.id);
    const workshop = await prisma.workshop.findUnique({ where: { id: response.body.data.id } });
    expect(workshop).not.toBeNull();
  });

  it("rejects a workshop with a past date", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.post("/api/admin/oficinas").send({
      title: "Oficina no passado",
      category: "Outros",
      description: "Esta oficina possui dados suficientes, mas uma data inválida.",
      startsAt: new Date(Date.now() - 60_000).toISOString(),
      durationMin: 120,
      capacity: 10,
      location: "Sala de testes",
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
    expect(response.body.fields.startsAt).toBeDefined();
  });

  it("lists both active and inactive workshops", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/oficinas")
      .query({ search: marker, pageSize: 10 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data.some((workshop: { active: boolean }) => workshop.active)).toBe(true);
    expect(response.body.data.some((workshop: { active: boolean }) => !workshop.active)).toBe(true);
    expect(response.body.pagination.totalItems).toBe(3);
    expect(
      response.body.data.find((workshop: { id: string }) => workshop.id === managedWorkshopId),
    ).toMatchObject({
      enrollmentCount: 3,
      occupiedSeats: 2,
      availableSeats: 10,
    });
  });

  it("filters inactive workshops", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/oficinas")
      .query({ search: marker, active: false });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].active).toBe(false);
  });

  it("paginates the administrative listing", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .get("/api/admin/oficinas")
      .query({ search: marker, page: 2, pageSize: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toEqual({
      page: 2,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2,
    });
  });

  it("blocks workshop updates without authentication", async () => {
    const [updateResponse, statusResponse] = await Promise.all([
      request(app).patch(`/api/admin/oficinas/${managedWorkshopId}`).send({ capacity: 10 }),
      request(app)
        .patch(`/api/admin/oficinas/${managedWorkshopId}/status`)
        .send({ active: false }),
    ]);

    expect(updateResponse.status).toBe(401);
    expect(statusResponse.status).toBe(401);
  });

  it("updates and persists workshop data", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.patch(`/api/admin/oficinas/${managedWorkshopId}`).send({
      title: `Cerâmica avançada ${marker}`,
      capacity: 2,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: managedWorkshopId,
      title: `Cerâmica avançada ${marker}`,
      capacity: 2,
    });

    const workshop = await prisma.workshop.findUnique({ where: { id: managedWorkshopId } });
    expect(workshop?.capacity).toBe(2);
  });

  it("rejects capacity below occupied seats", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/oficinas/${managedWorkshopId}`)
      .send({ capacity: 1 });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("CAPACITY_BELOW_OCCUPANCY");
  });

  it("rejects an empty update", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.patch(`/api/admin/oficinas/${managedWorkshopId}`).send({});

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
  });

  it("deactivates and reactivates a workshop", async () => {
    const agent = await authenticatedAgent();
    const deactivateResponse = await agent
      .patch(`/api/admin/oficinas/${managedWorkshopId}/status`)
      .send({ active: false });

    expect(deactivateResponse.status).toBe(200);
    expect(deactivateResponse.body.data.active).toBe(false);

    const publicResponse = await request(app).get(`/api/oficinas/${managedWorkshopId}`);
    expect(publicResponse.status).toBe(404);

    const reactivateResponse = await agent
      .patch(`/api/admin/oficinas/${managedWorkshopId}/status`)
      .send({ active: true });

    expect(reactivateResponse.status).toBe(200);
    expect(reactivateResponse.body.data.active).toBe(true);
  });

  it("rejects setting the current workshop status", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/oficinas/${managedWorkshopId}/status`)
      .send({ active: true });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("WORKSHOP_STATUS_ALREADY_SET");
  });
});
