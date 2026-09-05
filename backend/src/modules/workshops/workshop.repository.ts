import { EnrollmentStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { CreateWorkshopInput, ListWorkshopsQuery, UpdateWorkshopInput } from "./workshop.schemas.js";

const classSummaryInclude = {
  meetings: { orderBy: { startsAt: "asc" as const } },
  enrollments: { select: { status: true } },
};

type WorkshopWithClasses = Prisma.WorkshopGetPayload<{
  include: { classes: { include: typeof classSummaryInclude } };
}>;

function withoutLegacyFields(workshop: WorkshopWithClasses, includeEnrollmentCount = false) {
  const { classes, ...data } = workshop;
  const nextMeetingAt = classes
    .flatMap((workshopClass) => workshopClass.meetings)
    .filter((meeting) => meeting.startsAt > new Date())
    .sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime())[0]?.startsAt ?? null;
  const occupiedSeats = classes.reduce(
    (total, workshopClass) => total + workshopClass.enrollments.filter((enrollment) => enrollment.status !== EnrollmentStatus.CANCELADA).length,
    0,
  );
  const totalCapacity = classes.reduce((total, workshopClass) => total + workshopClass.capacity, 0);

  return {
    ...data,
    nextMeetingAt,
    classCount: classes.length,
    totalCapacity,
    occupiedSeats,
    availableSeats: Math.max(totalCapacity - occupiedSeats, 0),
    ...(includeEnrollmentCount
      ? { enrollmentCount: classes.reduce((total, workshopClass) => total + workshopClass.enrollments.length, 0) }
      : {}),
  };
}

export const workshopRepository = {
  async listActive() {
    const now = new Date();
    const workshops = await prisma.workshop.findMany({
      where: { active: true, classes: { some: { active: true, meetings: { some: { startsAt: { gt: now } } } } } },
      include: {
        classes: {
          where: { active: true, meetings: { some: { startsAt: { gt: now } } } },
          include: classSummaryInclude,
        },
      },
    });

    return workshops
      .map((workshop) => withoutLegacyFields(workshop))
      .sort((first, second) => first.nextMeetingAt!.getTime() - second.nextMeetingAt!.getTime());
  },

  async findPublicById(id: string) {
    const now = new Date();
    const workshop = await prisma.workshop.findFirst({
      where: { id, active: true, classes: { some: { active: true, meetings: { some: { startsAt: { gt: now } } } } } },
      include: {
        classes: {
          where: { active: true, meetings: { some: { startsAt: { gt: now } } } },
          include: classSummaryInclude,
        },
      },
    });

    return workshop ? withoutLegacyFields(workshop) : null;
  },

  async list(query: ListWorkshopsQuery) {
    const where: Prisma.WorkshopWhereInput = {
      active: query.active,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { category: { contains: query.search, mode: "insensitive" } },
              { classes: { some: { meetings: { some: { location: { contains: query.search, mode: "insensitive" } } } } } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.workshop.findMany({
        where,
        include: { classes: { include: classSummaryInclude } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.workshop.count({ where }),
    ]);

    return {
      items: items.map((workshop) => withoutLegacyFields(workshop, true)),
      totalItems,
    };
  },

  findById(id: string) {
    return prisma.workshop.findUnique({ where: { id } });
  },

  async create(data: CreateWorkshopInput) {
    const workshop = await prisma.workshop.create({
      data: {
        ...data,
      },
      include: { classes: { include: classSummaryInclude } },
    });
    return withoutLegacyFields(workshop);
  },

  async update(id: string, data: UpdateWorkshopInput) {
    const workshop = await prisma.workshop.update({
      where: { id },
      data,
      include: { classes: { include: classSummaryInclude } },
    });
    return withoutLegacyFields(workshop);
  },

  async updateStatus(id: string, active: boolean) {
    const workshop = await prisma.workshop.update({
      where: { id },
      data: { active },
      include: { classes: { include: classSummaryInclude } },
    });
    return withoutLegacyFields(workshop);
  },
};
