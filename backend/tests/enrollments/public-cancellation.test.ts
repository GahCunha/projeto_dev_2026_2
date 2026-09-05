import { randomUUID } from "node:crypto";
import { EnrollmentStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { emailService } from "../../src/shared/email/email.service.js";

let workshopId: string;

beforeAll(async () => {
  const workshop = await prisma.workshop.create({
    data: {
      title: `Oficina com cancelamento ${randomUUID()}`,
      description: "Oficina criada para testar o cancelamento pelo visitante.",
      startsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      durationMin: 120,
      capacity: 10,
      location: "Sala de testes",
    },
  });

  workshopId = workshop.id;
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId } });
  await prisma.workshop.delete({ where: { id: workshopId } });
  await prisma.$disconnect();
});

async function createEnrollmentAndGetToken() {
  const emailSpy = vi.spyOn(emailService, "sendEnrollmentReceived");
  const response = await request(app).post("/api/inscricoes").send({
    name: "Visitante Artesã",
    email: `cancelamento-${randomUUID()}@example.com`,
    workshopId,
  });

  expect(response.status).toBe(201);
  const emailData = emailSpy.mock.calls.at(-1)?.[0];
  emailSpy.mockRestore();

  expect(emailData?.cancellationUrl).toBeDefined();
  return new URL(emailData!.cancellationUrl!).pathname.split("/").at(-1)!;
}

describe("cancelamento público de inscrição", () => {
  it("shows the enrollment linked to a valid token without exposing private fields", async () => {
    const token = await createEnrollmentAndGetToken();
    const response = await request(app).get(`/api/inscricoes/cancelamento/${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      name: "Visitante Artesã",
      status: EnrollmentStatus.PENDENTE,
      workshop: { title: expect.any(String), location: "Sala de testes" },
    });
    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("cancellationTokenHash");
  });

  it("cancels the enrollment, releases its seat and sends a notification", async () => {
    const token = await createEnrollmentAndGetToken();
    const emailSpy = vi.spyOn(emailService, "sendEnrollmentCanceled");
    const response = await request(app).post(`/api/inscricoes/cancelamento/${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(EnrollmentStatus.CANCELADA);
    expect(emailSpy).toHaveBeenCalledOnce();
    emailSpy.mockRestore();
  });

  it("rejects a second cancellation with the same token", async () => {
    const token = await createEnrollmentAndGetToken();
    expect((await request(app).post(`/api/inscricoes/cancelamento/${token}`)).status).toBe(200);

    const response = await request(app).post(`/api/inscricoes/cancelamento/${token}`);
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("ENROLLMENT_ALREADY_CANCELED");
  });

  it("does not reveal whether a malformed or unknown token belongs to someone", async () => {
    const malformedResponse = await request(app).get("/api/inscricoes/cancelamento/token-invalido");
    const unknownResponse = await request(app).get(`/api/inscricoes/cancelamento/${"a".repeat(64)}`);

    expect(malformedResponse.status).toBe(422);
    expect(unknownResponse.status).toBe(404);
    expect(unknownResponse.body.error).toBe("CANCELLATION_NOT_FOUND");
  });
});
