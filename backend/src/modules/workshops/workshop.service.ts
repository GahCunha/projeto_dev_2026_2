import { AppError } from "../../shared/errors/app-error.js";
import { enrollmentRepository } from "../enrollments/enrollment.repository.js";
import { workshopRepository } from "./workshop.repository.js";
import type {
  CreateWorkshopInput,
  ListWorkshopsQuery,
  UpdateWorkshopInput,
} from "./workshop.schemas.js";

export const workshopService = {
  listActive() {
    return workshopRepository.listActive();
  },

  async list(query: ListWorkshopsQuery) {
    const { items, totalItems } = await workshopRepository.list(query);

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

  async findActiveById(id: string) {
    const workshop = await workshopRepository.findById(id);

    if (!workshop || !workshop.active) {
      throw new AppError("Oficina não encontrada ou indisponível.", 404, "WORKSHOP_NOT_FOUND");
    }

    return workshop;
  },

  create(data: CreateWorkshopInput) {
    return workshopRepository.create(data);
  },

  async update(id: string, data: UpdateWorkshopInput) {
    const workshop = await workshopRepository.findById(id);

    if (!workshop) {
      throw new AppError("Oficina não encontrada.", 404, "WORKSHOP_NOT_FOUND");
    }

    if (data.capacity !== undefined && data.capacity < workshop.capacity) {
      const occupiedSeats = await enrollmentRepository.countActiveByWorkshop(id);

      if (data.capacity < occupiedSeats) {
        throw new AppError(
          `A capacidade não pode ser menor que as ${occupiedSeats} vagas atualmente ocupadas.`,
          409,
          "CAPACITY_BELOW_OCCUPANCY",
        );
      }
    }

    return workshopRepository.update(id, data);
  },

  async updateStatus(id: string, active: boolean) {
    const workshop = await workshopRepository.findById(id);

    if (!workshop) {
      throw new AppError("Oficina não encontrada.", 404, "WORKSHOP_NOT_FOUND");
    }

    if (workshop.active === active) {
      throw new AppError(
        `A oficina já está ${active ? "ativa" : "inativa"}.`,
        409,
        "WORKSHOP_STATUS_ALREADY_SET",
      );
    }

    return workshopRepository.updateStatus(id, active);
  },
};
