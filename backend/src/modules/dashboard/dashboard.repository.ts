import { EnrollmentStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";

export const dashboardRepository = {
  async getSummary() {
    const now = new Date();
    const [workshops, pendingEnrollments, pendingPayments, recentEnrollments] =
      await Promise.all([
        prisma.workshop.findMany({
          where: { active: true },
          select: {
            id: true,
            title: true,
            classes: {
              where: {
                active: true,
                meetings: { some: { startsAt: { gt: now } } },
              },
              select: {
                capacity: true,
                enrollments: {
                  where: { status: { not: EnrollmentStatus.CANCELADA } },
                  select: { id: true },
                },
              },
            },
          },
          orderBy: { title: "asc" },
        }),
        prisma.enrollment.count({
          where: { status: EnrollmentStatus.PENDENTE },
        }),
        prisma.enrollment.count({
          where: {
            paymentStatus: PaymentStatus.PENDENTE,
            status: { not: EnrollmentStatus.CANCELADA },
          },
        }),
        prisma.enrollment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            class: {
              select: {
                name: true,
                workshop: { select: { id: true, title: true } },
              },
            },
          },
        }),
      ]);

    return {
      workshops,
      pendingEnrollments,
      pendingPayments,
      recentEnrollments,
    };
  },
};
