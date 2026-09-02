import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  CreateWorkshopInput,
  ListWorkshopsQuery,
  UpdateWorkshopInput,
} from "./workshop.schemas.js";

export const workshopRepository = {
  async listActive() {
    const workshops = await prisma.workshop.findMany({
      where: { active: true, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: [EnrollmentStatus.PENDENTE, EnrollmentStatus.CONFIRMADA] },
              },
            },
          },
        },
      },
    });

    return workshops.map(({ _count, ...workshop }) => ({
      ...workshop,
      availableSeats: Math.max(workshop.capacity - _count.enrollments, 0),
    }));
  },

  async findPublicById(id: string) {
    const workshop = await prisma.workshop.findFirst({
      where: { id, active: true, startsAt: { gt: new Date() } },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: [EnrollmentStatus.PENDENTE, EnrollmentStatus.CONFIRMADA] },
              },
            },
          },
        },
      },
    });

    if (!workshop) return null;

    const { _count, ...data } = workshop;
    return {
      ...data,
      availableSeats: Math.max(workshop.capacity - _count.enrollments, 0),
    };
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
