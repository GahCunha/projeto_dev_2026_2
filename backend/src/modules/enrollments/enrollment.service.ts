import { createHash, randomBytes } from "node:crypto";
import { EnrollmentStatus, Prisma } from "@prisma/client";
import { env } from "../../config/environment.js";
import { AppError } from "../../shared/errors/app-error.js";
import { emailService } from "../../shared/email/email.service.js";
import { workshopRepository } from "../workshops/workshop.repository.js";
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
    if (enrollmentWithEmail) {
      await emailService.sendEnrollmentCanceled({
        name: enrollmentWithEmail.name,
        email: enrollmentWithEmail.email,
        workshop: enrollmentWithEmail.workshop,
      });
    }

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

    const emailData = {
      name: enrollment.name,
      email: enrollment.email,
      workshop: enrollment.workshop,
    };

    if (input.status === EnrollmentStatus.CONFIRMADA) {
      await emailService.sendEnrollmentConfirmed(emailData);
    } else {
      await emailService.sendEnrollmentCanceled(emailData);
    }

    return updatedEnrollment;
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
    const workshop = await workshopRepository.findById(data.workshopId);

    if (!workshop || !workshop.active || workshop.startsAt <= new Date()) {
      throw new AppError(
        "Oficina não encontrada ou indisponível para inscrições.",
        422,
        "WORKSHOP_UNAVAILABLE",
      );
    }

    const occupiedSeats = await enrollmentRepository.countActiveByWorkshop(workshop.id);

    if (occupiedSeats >= workshop.capacity) {
      throw new AppError("Não há vagas disponíveis nesta oficina.", 409, "WORKSHOP_FULL");
    }

    try {
      const cancellationToken = randomBytes(32).toString("hex");
      const enrollment = await enrollmentRepository.create(
        data,
        hashCancellationToken(cancellationToken),
      );
      await emailService.sendEnrollmentReceived({
        name: enrollment.name,
        email: enrollment.email,
        workshop: {
          title: workshop.title,
          startsAt: workshop.startsAt,
          location: workshop.location,
        },
        cancellationUrl: cancellationUrl(cancellationToken),
      });

      return enrollment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(
          "Este e-mail já possui uma inscrição nesta oficina.",
          409,
          "ENROLLMENT_ALREADY_EXISTS",
        );
      }

      throw error;
    }
  },
};
