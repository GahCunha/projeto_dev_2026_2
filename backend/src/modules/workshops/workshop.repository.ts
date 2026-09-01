import { prisma } from "../../config/database.js";
import type { CreateWorkshopInput, UpdateWorkshopInput } from "./workshop.schemas.js";

export const workshopRepository = {
  listActive() {
    return prisma.workshop.findMany({
      where: { active: true },
      orderBy: { startsAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.workshop.findUnique({ where: { id } });
  },

  create(data: CreateWorkshopInput) {
    return prisma.workshop.create({ data });
  },

  update(id: string, data: UpdateWorkshopInput) {
    return prisma.workshop.update({ where: { id }, data });
  },
};


