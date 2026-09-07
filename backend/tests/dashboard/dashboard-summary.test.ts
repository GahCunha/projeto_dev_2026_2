import { randomUUID } from "node:crypto";
import { EnrollmentStatus, PaymentStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

const marker = randomUUID();
const adminEmail = `dashboard-${marker}@example.com`;
const adminPassword = "SenhaSegura@123";
let adminId: string;
let workshopId: string;

beforeAll(async () => {
  const startsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const [admin, workshop] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin do Resumo",
        email: adminEmail,
        passwordHash: await hash(adminPassword, 4),
      },
    }),
    prisma.workshop.create({
      data: {
        title: `Oficina do resumo ${marker}`,
        description: "Oficina criada para validar o resumo administrativo.",
        classes: {
          create: {
            name: "Turma do resumo",
            capacity: 10,
            price: 80,
            meetings: {
              create: {
                startsAt,
                endsAt: new Date(startsAt.getTime() + 7_200_000),
                location: "Sala de testes",
              },
            },
            enrollments: {
              create: {
                name: "Participante do resumo",
                email: `participante-${marker}@example.com`,
                status: EnrollmentStatus.PENDENTE,
                paymentStatus: PaymentStatus.PENDENTE,
              },
            },
          },
        },
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

describe("GET /api/admin/resumo", () => {
  it("blocks access without authentication", async () => {
    expect((await request(app).get("/api/admin/resumo")).status).toBe(401);
  });

  it("returns operational metrics, occupancy and recent enrollments", async () => {
    const response = await (
      await authenticatedAgent()
    ).get("/api/admin/resumo");

    expect(response.status).toBe(200);
    expect(response.body.data.metrics).toMatchObject({
      activeWorkshops: expect.any(Number),
      upcomingClasses: expect.any(Number),
      pendingEnrollments: expect.any(Number),
      pendingPayments: expect.any(Number),
    });
    expect(response.body.data.occupancyByWorkshop).toContainEqual(
      expect.objectContaining({
        id: workshopId,
        totalCapacity: 10,
        occupiedSeats: 1,
        occupancyPercentage: 10,
      }),
    );
    expect(response.body.data.recentEnrollments).toEqual(expect.any(Array));
  });
});
