import { EnrollmentStatus, PaymentStatus, Prisma } from "@prisma/client";
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

  createWithSeatReservation(
    data: CreateEnrollmentInput,
    cancellationTokenHash: string,
    paymentTokenHash: string,
  ) {
    return prisma.$transaction(async (transaction) => {
      let classId = data.classId;

      if (!classId && data.workshopId) {
        const lockedWorkshops = await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "oficinas" WHERE "id" = ${data.workshopId} FOR UPDATE
        `;
        if (lockedWorkshops.length === 0) return { outcome: "unavailable" } as const;

        const legacyWorkshop = await transaction.workshop.findUnique({
          where: { id: data.workshopId },
        });
        if (!legacyWorkshop) return { outcome: "unavailable" } as const;

        await transaction.workshopClass.upsert({
          where: { id: legacyWorkshop.id },
          update: {},
          create: {
            id: legacyWorkshop.id,
            workshopId: legacyWorkshop.id,
            name: "Turma inicial",
            capacity: legacyWorkshop.capacity,
            active: legacyWorkshop.active,
          },
        });
        await transaction.classMeeting.upsert({
          where: { id: legacyWorkshop.id },
          update: {},
          create: {
            id: legacyWorkshop.id,
            classId: legacyWorkshop.id,
            startsAt: legacyWorkshop.startsAt,
            endsAt: new Date(legacyWorkshop.startsAt.getTime() + legacyWorkshop.durationMin * 60_000),
            location: legacyWorkshop.location,
          },
        });
        classId = legacyWorkshop.id;
      }

      if (!classId) return { outcome: "unavailable" } as const;

      const lockedClasses = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "turmas" WHERE "id" = ${classId} FOR UPDATE
      `;
      if (lockedClasses.length === 0) return { outcome: "unavailable" } as const;

      const workshopClass = await transaction.workshopClass.findUnique({
        where: { id: classId },
        include: {
          workshop: { select: { id: true, title: true, active: true } },
          meetings: { orderBy: { startsAt: "asc" } },
        },
      });

      const firstFutureMeeting = workshopClass?.meetings.find((meeting) => meeting.startsAt > new Date());
      if (!workshopClass || !workshopClass.active || !workshopClass.workshop.active || !firstFutureMeeting) {
        return { outcome: "unavailable" } as const;
      }

      const occupiedSeats = await transaction.enrollment.count({
        where: {
          classId: workshopClass.id,
          status: { not: EnrollmentStatus.CANCELADA },
        },
      });

      if (occupiedSeats >= workshopClass.capacity) return { outcome: "full" } as const;

      const enrollment = await transaction.enrollment.create({
        data: {
          name: data.name,
          email: data.email,
          workshopId: workshopClass.workshopId,
          classId: workshopClass.id,
          status: EnrollmentStatus.PENDENTE,
          paymentStatus: workshopClass.price.greaterThan(0)
            ? PaymentStatus.PENDENTE
            : PaymentStatus.ISENTO,
          paymentTokenHash: workshopClass.price.greaterThan(0) ? paymentTokenHash : null,
          cancellationTokenHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          paymentStatus: true,
          workshopId: true,
          classId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        outcome: "created",
        enrollment,
        workshop: {
          title: workshopClass.workshop.title,
          className: workshopClass.name,
          price: workshopClass.price,
          meetings: workshopClass.meetings,
        },
      } as const;
    });
  },

  findById(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        workshopId: true,
        classId: true,
        class: {
          select: {
            name: true,
            price: true,
            meetings: { orderBy: { startsAt: "asc" } },
          },
        },
        workshop: {
          select: { title: true, startsAt: true, location: true },
        },
      },
    });
  },

  findByCancellationTokenHash(cancellationTokenHash: string) {
    return prisma.enrollment.findUnique({
      where: { cancellationTokenHash },
      select: {
        id: true,
        name: true,
        status: true,
        paymentStatus: true,
        workshop: {
          select: { title: true, startsAt: true, location: true },
        },
        class: {
          select: {
            name: true,
            price: true,
            meetings: { orderBy: { startsAt: "asc" } },
          },
        },
      },
    });
  },

  findByPaymentTokenHash(paymentTokenHash: string) {
    return prisma.enrollment.findUnique({
      where: { paymentTokenHash },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        workshop: { select: { title: true } },
        class: {
          select: {
            name: true,
            price: true,
            meetings: { orderBy: { startsAt: "asc" } },
          },
        },
      },
    });
  },

  async markPaymentAsPaid(paymentTokenHash: string) {
    const result = await prisma.enrollment.updateMany({
      where: {
        paymentTokenHash,
        paymentStatus: PaymentStatus.PENDENTE,
        status: { not: EnrollmentStatus.CANCELADA },
      },
      data: { paymentStatus: PaymentStatus.PAGO, paidAt: new Date() },
    });

    if (result.count === 0) return null;
    return this.findByPaymentTokenHash(paymentTokenHash);
  },

  async cancelByCancellationTokenHash(cancellationTokenHash: string) {
    const result = await prisma.enrollment.updateMany({
      where: {
        cancellationTokenHash,
        status: { in: [EnrollmentStatus.PENDENTE, EnrollmentStatus.CONFIRMADA] },
      },
      data: { status: EnrollmentStatus.CANCELADA },
    });

    if (result.count === 0) return null;
    return this.findByCancellationTokenHash(cancellationTokenHash);
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

    return prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        workshopId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async list(query: ListEnrollmentsQuery) {
    const where: Prisma.EnrollmentWhereInput = {
      status: query.status,
      workshopId: query.workshopId,
      classId: query.classId,
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
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          paymentStatus: true,
          paidAt: true,
          workshopId: true,
          classId: true,
          class: {
            select: {
              id: true,
              name: true,
              capacity: true,
              price: true,
              active: true,
              meetings: { orderBy: { startsAt: "asc" } },
            },
          },
          createdAt: true,
          updatedAt: true,
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
