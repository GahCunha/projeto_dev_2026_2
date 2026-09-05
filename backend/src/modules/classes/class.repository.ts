import { EnrollmentStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { CreateClassInput, UpdateClassInput } from "./class.schemas.js";

const classDetails = {
  workshop: {
    select: { id: true, title: true, category: true, imageUrl: true, materials: true },
  },
  meetings: { orderBy: { startsAt: "asc" as const } },
  _count: {
    select: {
      enrollments: { where: { status: { not: EnrollmentStatus.CANCELADA } } },
    },
  },
} satisfies Prisma.WorkshopClassInclude;

function withAvailability<T extends { capacity: number; price: unknown; _count: { enrollments: number } }>(item: T) {
  const { _count, price, ...data } = item;
  return {
    ...data,
    price: Number(price),
    occupiedSeats: _count.enrollments,
    availableSeats: Math.max(item.capacity - _count.enrollments, 0),
  };
}

export const classRepository = {
  findWorkshopById(workshopId: string) {
    return prisma.workshop.findUnique({ where: { id: workshopId }, select: { id: true } });
  },

  async listPublicByWorkshop(workshopId: string) {
    const items = await prisma.workshopClass.findMany({
      where: {
        workshopId,
        active: true,
        workshop: { active: true },
        meetings: { some: { startsAt: { gt: new Date() } } },
      },
      include: classDetails,
    });

    return items
      .sort((first, second) => {
        const firstDate = first.meetings[0]?.startsAt.getTime() ?? Number.MAX_SAFE_INTEGER;
        const secondDate = second.meetings[0]?.startsAt.getTime() ?? Number.MAX_SAFE_INTEGER;
        return firstDate - secondDate;
      })
      .map(withAvailability);
  },

  async findPublicById(id: string) {
    const item = await prisma.workshopClass.findFirst({
      where: {
        id,
        active: true,
        workshop: { active: true },
        meetings: { some: { startsAt: { gt: new Date() } } },
      },
      include: classDetails,
    });

    return item ? withAvailability(item) : null;
  },

  async listByWorkshop(workshopId: string) {
    const items = await prisma.workshopClass.findMany({
      where: { workshopId },
      include: classDetails,
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    });

    return items.map(withAvailability);
  },

  findById(id: string) {
    return prisma.workshopClass.findUnique({
      where: { id },
      include: classDetails,
    });
  },

  create(workshopId: string, data: CreateClassInput) {
    const { meetings, ...classData } = data;
    return prisma.workshopClass.create({
      data: {
        ...classData,
        workshopId,
        meetings: { create: meetings },
      },
      include: classDetails,
    });
  },

  update(id: string, data: UpdateClassInput) {
    const { meetings, ...classData } = data;
    return prisma.$transaction(async (transaction) => {
      if (meetings) {
        await transaction.classMeeting.deleteMany({ where: { classId: id } });
      }

      return transaction.workshopClass.update({
        where: { id },
        data: {
          ...classData,
          meetings: meetings ? { create: meetings } : undefined,
        },
        include: classDetails,
      });
    });
  },

  updateStatus(id: string, active: boolean) {
    return prisma.workshopClass.update({
      where: { id },
      data: { active },
      include: classDetails,
    });
  },

  countOccupiedSeats(id: string) {
    return prisma.enrollment.count({
      where: { classId: id, status: { not: EnrollmentStatus.CANCELADA } },
    });
  },
};
