import { createHash, randomBytes } from "node:crypto";
import { EnrollmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { env } from "../../config/environment.js";
import { AppError } from "../../shared/errors/app-error.js";
import { emailService } from "../../shared/email/email.service.js";
import { enrollmentRepository } from "./enrollment.repository.js";
import type {
  CreateEnrollmentInput,
  ListEnrollmentsQuery,
  UpdateEnrollmentStatusInput,
} from "./enrollment.schemas.js";

const allowedTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  PENDENTE: [EnrollmentStatus.CONFIRMADA, EnrollmentStatus.CANCELADA],
  CONFIRMADA: [EnrollmentStatus.CANCELADA],
  CANCELADA: [],
};

function hashCancellationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cancellationUrl(token: string) {
  return `${env.FRONTEND_URL.replace(/\/$/, "")}/inscricoes/cancelar/${token}`;
}

function paymentUrl(token: string) {
  return `${env.FRONTEND_URL.replace(/\/$/, "")}/inscricoes/pagamento/${token}`;
}

function enrollmentEmailData(enrollment: Awaited<ReturnType<typeof enrollmentRepository.findById>>) {
  if (!enrollment) return null;

  return {
    name: enrollment.name,
    email: enrollment.email,
    workshop: {
      title: enrollment.workshop.title,
      className: enrollment.class?.name ?? "Turma inicial",
      price: enrollment.class?.price ?? 0,
      meetings: enrollment.class?.meetings ?? [{
        startsAt: enrollment.workshop.startsAt,
        endsAt: enrollment.workshop.startsAt,
        location: enrollment.workshop.location,
      }],
    },
  };
}

function publicPayment(enrollment: NonNullable<Awaited<ReturnType<typeof enrollmentRepository.findByPaymentTokenHash>>>) {
  return {
    name: enrollment.name,
    status: enrollment.status,
    paymentStatus: enrollment.paymentStatus,
    paidAt: enrollment.paidAt,
    workshop: enrollment.workshop,
    class: enrollment.class,
  };
}

export const enrollmentService = {
  async getCancellation(token: string) {
    const enrollment = await enrollmentRepository.findByCancellationTokenHash(
      hashCancellationToken(token),
    );

    if (!enrollment) {
      throw new AppError("Link de cancelamento inválido ou expirado.", 404, "CANCELLATION_NOT_FOUND");
    }

    return enrollment;
  },

  async cancelWithToken(token: string) {
    const tokenHash = hashCancellationToken(token);
    const enrollment = await enrollmentRepository.findByCancellationTokenHash(tokenHash);

    if (!enrollment) {
      throw new AppError("Link de cancelamento inválido ou expirado.", 404, "CANCELLATION_NOT_FOUND");
    }

    if (enrollment.status === EnrollmentStatus.CANCELADA) {
      throw new AppError("Esta inscrição já foi cancelada.", 409, "ENROLLMENT_ALREADY_CANCELED");
    }

    const canceledEnrollment = await enrollmentRepository.cancelByCancellationTokenHash(tokenHash);

    if (!canceledEnrollment) {
      throw new AppError(
        "A inscrição foi alterada por outra operação. Atualize os dados e tente novamente.",
        409,
        "ENROLLMENT_CONFLICT",
      );
    }

    const enrollmentWithEmail = await enrollmentRepository.findById(enrollment.id);
    const emailData = enrollmentEmailData(enrollmentWithEmail);
    if (emailData) await emailService.sendEnrollmentCanceled(emailData);

    return canceledEnrollment;
  },

  async updateStatus(id: string, input: UpdateEnrollmentStatusInput) {
    const enrollment = await enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new AppError("Inscrição não encontrada.", 404, "ENROLLMENT_NOT_FOUND");
    }

    if (enrollment.status === input.status) {
      throw new AppError("A inscrição já possui este status.", 409, "STATUS_ALREADY_SET");
    }

    if (!allowedTransitions[enrollment.status].includes(input.status)) {
      throw new AppError(
        `Não é possível alterar uma inscrição de ${enrollment.status} para ${input.status}.`,
        409,
        "INVALID_STATUS_TRANSITION",
      );
    }

    if (
      input.status === EnrollmentStatus.CONFIRMADA
      && enrollment.paymentStatus === PaymentStatus.PENDENTE
    ) {
      throw new AppError(
        "A inscrição só pode ser confirmada depois do pagamento.",
        409,
        "PAYMENT_REQUIRED",
      );
    }

    const updatedEnrollment = await enrollmentRepository.updateStatus(
      id,
      enrollment.status,
      input.status,
    );

    if (!updatedEnrollment) {
      throw new AppError(
        "A inscrição foi alterada por outra operação. Atualize os dados e tente novamente.",
        409,
        "ENROLLMENT_CONFLICT",
      );
    }

    const emailData = enrollmentEmailData(enrollment);
    if (!emailData) throw new AppError("Inscrição não encontrada.", 404, "ENROLLMENT_NOT_FOUND");

    if (input.status === EnrollmentStatus.CONFIRMADA) {
      await emailService.sendEnrollmentConfirmed(emailData);
    } else {
      await emailService.sendEnrollmentCanceled(emailData);
    }

    return updatedEnrollment;
  },

  async getPayment(token: string) {
    const enrollment = await enrollmentRepository.findByPaymentTokenHash(hashCancellationToken(token));
    if (!enrollment) {
      throw new AppError("Link de pagamento inválido ou expirado.", 404, "PAYMENT_NOT_FOUND");
    }

    return publicPayment(enrollment);
  },

  async simulatePayment(token: string) {
    const tokenHash = hashCancellationToken(token);
    const enrollment = await enrollmentRepository.findByPaymentTokenHash(tokenHash);

    if (!enrollment) {
      throw new AppError("Link de pagamento inválido ou expirado.", 404, "PAYMENT_NOT_FOUND");
    }
    if (enrollment.status === EnrollmentStatus.CANCELADA) {
      throw new AppError("Não é possível pagar uma inscrição cancelada.", 409, "ENROLLMENT_CANCELED");
    }
    if (enrollment.paymentStatus === PaymentStatus.PAGO) {
      throw new AppError("Este pagamento já foi registrado.", 409, "PAYMENT_ALREADY_PAID");
    }

    const paidEnrollment = await enrollmentRepository.markPaymentAsPaid(tokenHash);
    if (!paidEnrollment) {
      throw new AppError("O pagamento foi alterado por outra operação.", 409, "PAYMENT_CONFLICT");
    }

    if (paidEnrollment.class) {
      const emailData = {
        name: paidEnrollment.name,
        email: paidEnrollment.email,
        workshop: {
          title: paidEnrollment.workshop.title,
          className: paidEnrollment.class.name,
          price: paidEnrollment.class.price,
          meetings: paidEnrollment.class.meetings,
        },
      };
      await Promise.all([
        emailService.sendPaymentReceived(emailData),
        emailService.sendPaymentNotificationToAdmin(emailData),
      ]);
    }

    return publicPayment(paidEnrollment);
  },

  async list(query: ListEnrollmentsQuery) {
    const { items, totalItems } = await enrollmentRepository.list(query);

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize),
      },
    };
  },

  async create(data: CreateEnrollmentInput) {
    try {
      const cancellationToken = randomBytes(32).toString("hex");
      const paymentToken = randomBytes(32).toString("hex");
      const reservation = await enrollmentRepository.createWithSeatReservation(
        data,
        hashCancellationToken(cancellationToken),
        hashCancellationToken(paymentToken),
      );

      if (reservation.outcome === "unavailable") {
        throw new AppError(
          "Turma não encontrada ou indisponível para inscrições.",
          422,
          "CLASS_UNAVAILABLE",
        );
      }

      if (reservation.outcome === "full") {
        throw new AppError("Não há vagas disponíveis nesta turma.", 409, "CLASS_FULL");
      }

      const { enrollment, workshop } = reservation;
      await emailService.sendEnrollmentReceived({
        name: enrollment.name,
        email: enrollment.email,
        workshop: {
          title: workshop.title,
          className: workshop.className,
          price: workshop.price,
          meetings: workshop.meetings,
        },
        paymentUrl: enrollment.paymentStatus === PaymentStatus.PENDENTE
          ? paymentUrl(paymentToken)
          : undefined,
        cancellationUrl: cancellationUrl(cancellationToken),
      });

      return enrollment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(
          "Este e-mail já possui uma inscrição nesta turma.",
          409,
          "ENROLLMENT_ALREADY_EXISTS",
        );
      }

      throw error;
    }
  },
};
