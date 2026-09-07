import { EnrollmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  CreateEnrollmentInput,
  ListEnrollmentsQuery,
  UpdateEnrollmentStatusInput,
} from "./enrollment.schemas.js";

export const enrollmentRepository = {
  createWithSeatReservation(
    data: CreateEnrollmentInput,
    cancellationTokenHash: string,
    paymentTokenHash: string,
  ) {
    return prisma.$transaction(async (transaction) => {
      const classId = data.classId;

      const lockedClasses = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "turmas" WHERE "id" = ${classId} FOR UPDATE
      `;
      if (lockedClasses.length === 0)
        return { outcome: "unavailable" } as const;

      const workshopClass = await transaction.workshopClass.findUnique({
        where: { id: classId },
        include: {
          workshop: { select: { id: true, title: true, active: true } },
          meetings: { orderBy: { startsAt: "asc" } },
        },
      });

      const firstFutureMeeting = workshopClass?.meetings.find(
        (meeting) => meeting.startsAt > new Date(),
      );
      if (
        !workshopClass ||
        !workshopClass.active ||
        !workshopClass.workshop.active ||
        !firstFutureMeeting
      ) {
        return { outcome: "unavailable" } as const;
      }

      const occupiedSeats = await transaction.enrollment.count({
        where: {
          classId: workshopClass.id,
          status: { not: EnrollmentStatus.CANCELADA },
        },
      });

      if (occupiedSeats >= workshopClass.capacity)
        return { outcome: "full" } as const;

      const enrollment = await transaction.enrollment.create({
        data: {
          name: data.name,
          email: data.email,
          classId: workshopClass.id,
          status: EnrollmentStatus.PENDENTE,
          paymentStatus: workshopClass.price.greaterThan(0)
            ? PaymentStatus.PENDENTE
            : PaymentStatus.ISENTO,
          paymentTokenHash: workshopClass.price.greaterThan(0)
            ? paymentTokenHash
            : null,
          cancellationTokenHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          paymentStatus: true,
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
    return prisma.enrollment
      .findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          paymentStatus: true,
          classId: true,
          class: {
            select: {
              name: true,
              price: true,
              meetings: { orderBy: { startsAt: "asc" } },
              workshop: { select: { title: true } },
            },
          },
        },
      })
      .then((enrollment) =>
        enrollment
          ? {
              ...enrollment,
              workshop: enrollment.class.workshop,
              class: { ...enrollment.class, workshop: undefined },
            }
          : null,
      );
  },

  findByCancellationTokenHash(cancellationTokenHash: string) {
    return prisma.enrollment
      .findUnique({
        where: { cancellationTokenHash },
        select: {
          id: true,
          name: true,
          status: true,
          paymentStatus: true,
          class: {
            select: {
              name: true,
              price: true,
              meetings: { orderBy: { startsAt: "asc" } },
              workshop: { select: { title: true } },
            },
          },
        },
      })
      .then((enrollment) =>
        enrollment
          ? {
              ...enrollment,
              workshop: enrollment.class.workshop,
              class: { ...enrollment.class, workshop: undefined },
            }
          : null,
      );
  },

  findByPaymentTokenHash(paymentTokenHash: string) {
    return prisma.enrollment
      .findUnique({
        where: { paymentTokenHash },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          paymentStatus: true,
          paidAt: true,
          class: {
            select: {
              name: true,
              price: true,
              meetings: { orderBy: { startsAt: "asc" } },
              workshop: { select: { title: true } },
            },
          },
        },
      })
      .then((enrollment) =>
        enrollment
          ? {
              ...enrollment,
              workshop: enrollment.class.workshop,
              class: { ...enrollment.class, workshop: undefined },
            }
          : null,
      );
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
        status: {
          in: [EnrollmentStatus.PENDENTE, EnrollmentStatus.CONFIRMADA],
        },
      },
      data: {
        status: EnrollmentStatus.CANCELADA,
        paymentStatus: PaymentStatus.CANCELADO,
      },
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
      data: {
        status,
        paymentStatus:
          status === EnrollmentStatus.CANCELADA
            ? PaymentStatus.CANCELADO
            : undefined,
      },
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
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async list(query: ListEnrollmentsQuery) {
    const where: Prisma.EnrollmentWhereInput = {
      status: query.status,
      paymentStatus: query.paymentStatus,
      class: query.workshopId ? { workshopId: query.workshopId } : undefined,
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
          classId: true,
          class: {
            select: {
              id: true,
              name: true,
              capacity: true,
              price: true,
              active: true,
              meetings: { orderBy: { startsAt: "asc" } },
              workshop: { select: { id: true, title: true, active: true } },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      items: items.map((enrollment) => ({
        ...enrollment,
        workshop: enrollment.class.workshop,
        class: { ...enrollment.class, workshop: undefined },
      })),
      totalItems,
    };
  },
};
