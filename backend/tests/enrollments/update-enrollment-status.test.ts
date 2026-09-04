import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { emailService } from "../../src/shared/email/email.service.js";

const marker = randomUUID();
const adminEmail = `status-admin-${marker}@example.com`;
const adminPassword = "SenhaSegura@123";
let adminId: string;
let workshopId: string;
let pendingEnrollmentId: string;
let canceledEnrollmentId: string;

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      name: "Admin dos Status",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 4),
    },
  });

  const workshop = await prisma.workshop.create({
    data: {
      title: `Oficina de status ${marker}`,
      description: "Oficina criada para testar alterações de status.",
      startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      durationMin: 120,
      capacity: 10,
      location: "Sala de testes",
    },
  });

  const [pendingEnrollment, canceledEnrollment] = await Promise.all([
    prisma.enrollment.create({
      data: {
        name: "Pessoa Pendente",
        email: `pending-${marker}@example.com`,
        workshopId: workshop.id,
      },
    }),
    prisma.enrollment.create({
      data: {
        name: "Pessoa Cancelada",
        email: `canceled-${marker}@example.com`,
        status: EnrollmentStatus.CANCELADA,
        workshopId: workshop.id,
      },
    }),
  ]);

  adminId = admin.id;
  workshopId = workshop.id;
  pendingEnrollmentId = pendingEnrollment.id;
  canceledEnrollmentId = canceledEnrollment.id;
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId } });
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

describe("PATCH /api/admin/inscricoes/:id/status", () => {
  it("blocks access without authentication", async () => {
    const response = await request(app)
      .patch(`/api/admin/inscricoes/${pendingEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.CONFIRMADA });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("confirms a pending enrollment and persists the change", async () => {
    const emailSpy = vi.spyOn(emailService, "sendEnrollmentConfirmed");
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${pendingEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.CONFIRMADA });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: pendingEnrollmentId,
      status: EnrollmentStatus.CONFIRMADA,
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: pendingEnrollmentId },
    });
    expect(enrollment?.status).toBe(EnrollmentStatus.CONFIRMADA);
    expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: "Pessoa Pendente",
      workshop: expect.objectContaining({ title: expect.any(String) }),
    }));
    emailSpy.mockRestore();
  });

  it("cancels a confirmed enrollment", async () => {
    const emailSpy = vi.spyOn(emailService, "sendEnrollmentCanceled");
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${pendingEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.CANCELADA });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(EnrollmentStatus.CANCELADA);
    expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: "Pessoa Pendente",
      workshop: expect.objectContaining({ title: expect.any(String) }),
    }));
    emailSpy.mockRestore();
  });

  it("rejects a transition from canceled to confirmed", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${canceledEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.CONFIRMADA });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("INVALID_STATUS_TRANSITION");
  });

  it("rejects setting the status already assigned", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${canceledEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.CANCELADA });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("STATUS_ALREADY_SET");
  });

  it("rejects PENDENTE as a destination status", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${canceledEnrollmentId}/status`)
      .send({ status: EnrollmentStatus.PENDENTE });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("INVALID_DATA");
  });

  it("returns not found for an unknown enrollment", async () => {
    const agent = await authenticatedAgent();
    const response = await agent
      .patch(`/api/admin/inscricoes/${randomUUID()}/status`)
      .send({ status: EnrollmentStatus.CONFIRMADA });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("ENROLLMENT_NOT_FOUND");
  });
});
