import type { EnrollmentStatus, PaymentStatus } from './enrollment'

export type EnrollmentPayment = {
  name: string
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  paidAt: string | null
  workshop: { title: string }
  class: {
    name: string
    price: number
    meetings: Array<{ id: string; startsAt: string; endsAt: string; location: string }>
  }
}

export type EnrollmentPaymentResponse = { data: EnrollmentPayment }
