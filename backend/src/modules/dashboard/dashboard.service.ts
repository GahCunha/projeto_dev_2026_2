import { dashboardRepository } from "./dashboard.repository.js";

export const dashboardService = {
  async getSummary() {
    const data = await dashboardRepository.getSummary();
    const occupancyByWorkshop = data.workshops.map((workshop) => {
      const totalCapacity = workshop.classes.reduce(
        (total, workshopClass) => total + workshopClass.capacity,
        0,
      );
      const occupiedSeats = workshop.classes.reduce(
        (total, workshopClass) => total + workshopClass.enrollments.length,
        0,
      );

      return {
        id: workshop.id,
        title: workshop.title,
        totalCapacity,
        occupiedSeats,
        availableSeats: Math.max(0, totalCapacity - occupiedSeats),
        occupancyPercentage:
          totalCapacity === 0
            ? 0
            : Math.round((occupiedSeats / totalCapacity) * 100),
      };
    });

    const totalCapacity = occupancyByWorkshop.reduce(
      (total, workshop) => total + workshop.totalCapacity,
      0,
    );
    const occupiedSeats = occupancyByWorkshop.reduce(
      (total, workshop) => total + workshop.occupiedSeats,
      0,
    );

    return {
      metrics: {
        activeWorkshops: data.workshops.length,
        upcomingClasses: data.workshops.reduce(
          (total, workshop) => total + workshop.classes.length,
          0,
        ),
        totalCapacity,
        occupiedSeats,
        availableSeats: Math.max(0, totalCapacity - occupiedSeats),
        pendingEnrollments: data.pendingEnrollments,
        pendingPayments: data.pendingPayments,
      },
      occupancyByWorkshop: occupancyByWorkshop
        .filter((workshop) => workshop.totalCapacity > 0)
        .sort(
          (first, second) =>
            second.occupancyPercentage - first.occupancyPercentage,
        )
        .slice(0, 6),
      recentEnrollments: data.recentEnrollments.map((enrollment) => ({
        id: enrollment.id,
        name: enrollment.name,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        createdAt: enrollment.createdAt,
        workshop: enrollment.class.workshop,
        className: enrollment.class.name,
      })),
    };
  },
};
