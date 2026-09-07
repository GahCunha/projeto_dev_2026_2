import type { EnrollmentStatus, PaymentStatus } from './enrollment'

export type DashboardSummary = {
  metrics: {
    activeWorkshops: number
    upcomingClasses: number
    totalCapacity: number
    occupiedSeats: number
    availableSeats: number
    pendingEnrollments: number
    pendingPayments: number
  }
  occupancyByWorkshop: Array<{
    id: string
    title: string
    totalCapacity: number
    occupiedSeats: number
    availableSeats: number
    occupancyPercentage: number
  }>
  recentEnrollments: Array<{
    id: string
    name: string
    status: EnrollmentStatus
    paymentStatus: PaymentStatus
    createdAt: string
    workshop: { id: string; title: string }
    className: string
  }>
}

export type DashboardSummaryResponse = { data: DashboardSummary }
