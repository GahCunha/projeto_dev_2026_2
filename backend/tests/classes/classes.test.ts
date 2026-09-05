import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const marker = randomUUID();
const adminEmail = `classes-admin-${marker}@example.com`;
const adminPassword = "SenhaSegura@123";
let adminId: string;
let workshopId: string;
let classId: string;

function futureDate(days: number, hour = 13) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

beforeAll(async () => {
  const [admin, workshop] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin das Turmas",
        email: adminEmail,
        passwordHash: await hash(adminPassword, 4),
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Tecelagem ${marker}`,
        category: "Têxtil",
        description: "Oficina usada para validar turmas com várias aulas.",
      },
    }),
  ]);

  adminId = admin.id;
  workshopId = workshop.id;
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { class: { workshopId } } });
  await prisma.workshop.delete({ where: { id: workshopId } });
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

describe("workshop classes", () => {
  it("blocks administrative class routes without authentication", async () => {
    const response = await request(app).post(`/api/admin/oficinas/${workshopId}/turmas`).send({});
    expect(response.status).toBe(401);
  });

  it("creates a class with multiple meetings", async () => {
    const agent = await authenticatedAgent();
    const firstStart = futureDate(15, 18);
    const secondStart = futureDate(17, 18);
    const response = await agent.post(`/api/admin/oficinas/${workshopId}/turmas`).send({
      name: "Turma noturna de setembro",
      capacity: 8,
      price: 120,
      meetings: [
        {
          startsAt: firstStart.toISOString(),
          endsAt: new Date(firstStart.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          location: "Sala Têxtil 1",
        },
        {
          startsAt: secondStart.toISOString(),
          endsAt: new Date(secondStart.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          location: "Sala Têxtil 1",
        },
      ],
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: "Turma noturna de setembro",
      capacity: 8,
      price: 120,
      occupiedSeats: 0,
      availableSeats: 8,
    });
    expect(response.body.data.meetings).toHaveLength(2);
    classId = response.body.data.id;
  });

  it("lists the active class publicly with its workshop and meetings", async () => {
    const response = await request(app).get(`/api/oficinas/${workshopId}/turmas`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: classId,
      workshop: { id: workshopId, title: `Tecelagem ${marker}` },
      availableSeats: 8,
    });
    expect(response.body.data[0].meetings).toHaveLength(2);
  });

  it("creates an enrollment directly for the selected class", async () => {
    const response = await request(app).post("/api/inscricoes").send({
      name: "Participante pela API",
      email: `class-api-${marker}@example.com`,
      classId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ classId });
    expect(response.body.data).not.toHaveProperty("workshopId");
  });

  it("calculates occupancy and prevents capacity below occupied seats", async () => {
    await prisma.enrollment.createMany({
      data: [
        {
          name: "Primeira participante",
          email: `class-participant-1-${marker}@example.com`,
          classId,
        },
        {
          name: "Segunda participante",
          email: `class-participant-2-${marker}@example.com`,
          classId,
        },
      ],
    });

    const agent = await authenticatedAgent();
    const listResponse = await agent.get(`/api/admin/oficinas/${workshopId}/turmas`);
    expect(listResponse.body.data[0]).toMatchObject({ occupiedSeats: 3, availableSeats: 5 });

    const updateResponse = await agent.patch(`/api/admin/turmas/${classId}`).send({ capacity: 2 });
    expect(updateResponse.status).toBe(409);
    expect(updateResponse.body.error).toBe("CAPACITY_BELOW_OCCUPANCY");
  });

  it("deactivates a class and removes it from the public listing", async () => {
    const agent = await authenticatedAgent();
    const response = await agent.patch(`/api/admin/turmas/${classId}/status`).send({ active: false });
    expect(response.status).toBe(200);
    expect(response.body.data.active).toBe(false);

    const publicResponse = await request(app).get(`/api/oficinas/${workshopId}/turmas`);
    expect(publicResponse.body.data).toHaveLength(0);
  });
});
