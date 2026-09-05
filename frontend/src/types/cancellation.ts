import type { EnrollmentStatus } from './enrollment'

export type EnrollmentCancellation = {
  id: string
  name: string
  status: EnrollmentStatus
  workshop: {
    title: string
    startsAt: string
    location: string
  }
}

export type EnrollmentCancellationResponse = {
  data: EnrollmentCancellation
}
