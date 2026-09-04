import { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  CreateEnrollmentInput,
  ListEnrollmentsQuery,
  UpdateEnrollmentStatusInput,
} from "./enrollment.schemas.js";

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

  findById(id: string) {
    return prisma.enrollment.findUnique({ where: { id } });
  },

  async updateStatus(
    id: string,
    currentStatus: EnrollmentStatus,
    status: UpdateEnrollmentStatusInput["status"],
  ) {
    const result = await prisma.enrollment.updateMany({
      where: { id, status: currentStatus },
      data: { status },
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.enrollment.findUnique({ where: { id } });
  },

  async list(query: ListEnrollmentsQuery) {
    const where: Prisma.EnrollmentWhereInput = {
      status: query.status,
      workshopId: query.workshopId,
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
