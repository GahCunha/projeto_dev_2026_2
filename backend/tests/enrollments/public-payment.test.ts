import { randomUUID } from "node:crypto";
import { EnrollmentStatus, PaymentStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { emailService } from "../../src/shared/email/email.service.js";

let workshopId: string;
let classId: string;

beforeAll(async () => {
  const startsAt = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  const workshop = await prisma.workshop.create({
    data: {
      title: `Oficina paga ${randomUUID()}`,
      description: "Oficina criada para testar o pagamento ilustrativo.",
      startsAt,
      durationMin: 120,
      capacity: 10,
      location: "Sala de testes",
      classes: {
        create: {
          name: "Turma paga",
          capacity: 10,
          price: 75,
          meetings: {
            create: [{ startsAt, endsAt: new Date(startsAt.getTime() + 7_200_000), location: "Sala de testes" }],
          },
        },
      },
    },
    include: { classes: true },
  });

  workshopId = workshop.id;
  classId = workshop.classes[0]!.id;
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { workshopId } });
  await prisma.workshop.delete({ where: { id: workshopId } });
  await prisma.$disconnect();
});

async function createEnrollmentAndGetPaymentToken() {
  const emailSpy = vi.spyOn(emailService, "sendEnrollmentReceived");
  const response = await request(app).post("/api/inscricoes").send({
    name: "Pessoa Pagante",
    email: `pagamento-${randomUUID()}@example.com`,
    classId,
  });

  expect(response.status).toBe(201);
  expect(response.body.data.paymentStatus).toBe(PaymentStatus.PENDENTE);
  const emailData = emailSpy.mock.calls.at(-1)?.[0];
  emailSpy.mockRestore();
  expect(emailData?.paymentUrl).toBeDefined();

  return new URL(emailData!.paymentUrl!).pathname.split("/").at(-1)!;
}

describe("pagamento público ilustrativo", () => {
  it("shows payment details without exposing private fields", async () => {
    const token = await createEnrollmentAndGetPaymentToken();
    const response = await request(app).get(`/api/inscricoes/pagamento/${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      name: "Pessoa Pagante",
      status: EnrollmentStatus.PENDENTE,
      paymentStatus: PaymentStatus.PENDENTE,
      workshop: { title: expect.any(String) },
      class: { name: "Turma paga", price: "75" },
    });
    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("paymentTokenHash");
  });

  it("registers payment, keeps enrollment pending and notifies both parties", async () => {
    const token = await createEnrollmentAndGetPaymentToken();
    const participantSpy = vi.spyOn(emailService, "sendPaymentReceived");
    const adminSpy = vi.spyOn(emailService, "sendPaymentNotificationToAdmin");
    const response = await request(app).post(`/api/inscricoes/pagamento/${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      status: EnrollmentStatus.PENDENTE,
      paymentStatus: PaymentStatus.PAGO,
    });
    expect(response.body.data.paidAt).toBeTruthy();
    expect(participantSpy).toHaveBeenCalledOnce();
    expect(adminSpy).toHaveBeenCalledOnce();
    participantSpy.mockRestore();
    adminSpy.mockRestore();
  });

  it("rejects registering the same payment twice", async () => {
    const token = await createEnrollmentAndGetPaymentToken();
    expect((await request(app).post(`/api/inscricoes/pagamento/${token}`)).status).toBe(200);

    const response = await request(app).post(`/api/inscricoes/pagamento/${token}`);
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("PAYMENT_ALREADY_PAID");
  });
});
