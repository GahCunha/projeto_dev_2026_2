import { AppError } from "../../shared/errors/app-error.js";
import { classRepository } from "./class.repository.js";
import type { CreateClassInput, UpdateClassInput } from "./class.schemas.js";

function formatClass<T extends { capacity: number; price: unknown; _count?: { enrollments: number } }>(item: T) {
  if (!("_count" in item) || !item._count) return item;
  const { _count, price, ...data } = item;
  return {
    ...data,
    price: Number(price),
    occupiedSeats: _count.enrollments,
    availableSeats: Math.max(item.capacity - _count.enrollments, 0),
  };
}

export const classService = {
  async listPublicByWorkshop(workshopId: string) {
    const workshop = await classRepository.findWorkshopById(workshopId);
    if (!workshop) {
      throw new AppError("Oficina não encontrada.", 404, "WORKSHOP_NOT_FOUND");
    }
    return classRepository.listPublicByWorkshop(workshopId);
  },

  async findPublicById(id: string) {
    const item = await classRepository.findPublicById(id);
    if (!item) {
      throw new AppError("Turma não encontrada ou indisponível.", 404, "CLASS_NOT_FOUND");
    }
    return item;
  },

  async listByWorkshop(workshopId: string) {
    const workshop = await classRepository.findWorkshopById(workshopId);
    if (!workshop) {
      throw new AppError("Oficina não encontrada.", 404, "WORKSHOP_NOT_FOUND");
    }
    return classRepository.listByWorkshop(workshopId);
  },

  async create(workshopId: string, data: CreateClassInput) {
    const workshop = await classRepository.findWorkshopById(workshopId);
    if (!workshop) {
      throw new AppError("Oficina não encontrada.", 404, "WORKSHOP_NOT_FOUND");
    }
    return formatClass(await classRepository.create(workshopId, data));
  },

  async update(id: string, data: UpdateClassInput) {
    const item = await classRepository.findById(id);
    if (!item) {
      throw new AppError("Turma não encontrada.", 404, "CLASS_NOT_FOUND");
    }

    if (data.capacity !== undefined) {
      const occupiedSeats = await classRepository.countOccupiedSeats(id);
      if (data.capacity < occupiedSeats) {
        throw new AppError(
          `A capacidade não pode ser menor que as ${occupiedSeats} vagas atualmente ocupadas.`,
          409,
          "CAPACITY_BELOW_OCCUPANCY",
        );
      }
    }

    return formatClass(await classRepository.update(id, data));
  },

  async updateStatus(id: string, active: boolean) {
    const item = await classRepository.findById(id);
    if (!item) {
      throw new AppError("Turma não encontrada.", 404, "CLASS_NOT_FOUND");
    }
    if (item.active === active) {
      throw new AppError(
        `A turma já está ${active ? "ativa" : "inativa"}.`,
        409,
        "CLASS_STATUS_ALREADY_SET",
      );
    }
    return formatClass(await classRepository.updateStatus(id, active));
  },
};
