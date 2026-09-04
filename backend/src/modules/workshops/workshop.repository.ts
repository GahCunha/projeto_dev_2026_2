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

    return prisma.$transaction(async (transaction) => {
      const [items, totalItems] = await Promise.all([
        transaction.workshop.findMany({
        where,
        include: { _count: { select: { enrollments: true } } },
        orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
        transaction.workshop.count({ where }),
      ]);

      const occupiedByWorkshop = items.length
        ? await transaction.enrollment.groupBy({
            by: ["workshopId"],
            where: {
              workshopId: { in: items.map((workshop) => workshop.id) },
              status: { in: [EnrollmentStatus.PENDENTE, EnrollmentStatus.CONFIRMADA] },
            },
            _count: { _all: true },
          })
        : [];

      const occupiedSeatsMap = new Map(
        occupiedByWorkshop.map((group) => [group.workshopId, group._count._all]),
      );

      const workshops = items.map(({ _count, ...workshop }) => {
        const occupiedSeats = occupiedSeatsMap.get(workshop.id) ?? 0;
        return {
          ...workshop,
          enrollmentCount: _count.enrollments,
          occupiedSeats,
          availableSeats: Math.max(workshop.capacity - occupiedSeats, 0),
        };
      });

      return { items: workshops, totalItems };
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

  updateStatus(id: string, active: boolean) {
    return prisma.workshop.update({ where: { id }, data: { active } });
  },
};
