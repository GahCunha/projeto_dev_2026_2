import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error.js";
import { workshopRepository } from "../workshops/workshop.repository.js";
import { enrollmentRepository } from "./enrollment.repository.js";
import type { CreateEnrollmentInput } from "./enrollment.schemas.js";

export const enrollmentService = {
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
