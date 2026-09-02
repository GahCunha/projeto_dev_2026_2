import { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { CreateEnrollmentInput, ListEnrollmentsQuery } from "./enrollment.schemas.js";

export const enrollmentRepository = {
  countActiveByWorkshop(workshopId: string) {
    return prisma.enrollment.count({
      where: {
        workshopId,
        status: { not: EnrollmentStatus.CANCELADA },
      },
    });
  },

  create(data: CreateEnrollmentInput) {
    return prisma.enrollment.create({
      data: {
        ...data,
        status: EnrollmentStatus.PENDENTE,
      },
    });
  },

  async list(query: ListEnrollmentsQuery) {
    const where: Prisma.EnrollmentWhereInput = {
      status: query.status,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.enrollment.findMany({
        where,
        include: {
          workshop: {
            select: {
              id: true,
              title: true,
              startsAt: true,
              active: true,
            },
          },
        },
        orderBy: [{ workshop: { startsAt: "asc" } }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.enrollment.count({ where }),
    ]);

    return { items, totalItems };
  },
};
