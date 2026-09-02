import { prisma } from "../../config/database.js";
import type {
  CreateWorkshopInput,
  ListWorkshopsQuery,
  UpdateWorkshopInput,
} from "./workshop.schemas.js";

export const workshopRepository = {
  listActive() {
    return prisma.workshop.findMany({
      where: { active: true },
      orderBy: { startsAt: "asc" },
    });
  },

  async list(query: ListWorkshopsQuery) {
    const where = {
      active: query.active,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" as const } },
              { location: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.workshop.findMany({
        where,
        orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.workshop.count({ where }),
    ]);

    return { items, totalItems };
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

  updateStatus(id: string, active: boolean) {
    return prisma.workshop.update({ where: { id }, data: { active } });
  },
};
