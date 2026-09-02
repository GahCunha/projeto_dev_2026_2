import { EnrollmentStatus, Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error.js";
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

export const enrollmentService = {
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
      return await enrollmentRepository.create(data);
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
