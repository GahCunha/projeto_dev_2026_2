import { AppError } from "../../shared/errors/app-error.js";
import { workshopRepository } from "./workshop.repository.js";
import type { CreateWorkshopInput, UpdateWorkshopInput } from "./workshop.schemas.js";

export const workshopService = {
  listActive() {
    return workshopRepository.listActive();
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

    return workshopRepository.update(id, data);
  },
};


