import type { EnrollmentStatus } from './enrollment'

export type EnrollmentCancellation = {
  id: string
  name: string
  status: EnrollmentStatus
  workshop: {
    title: string
  }
  class: {
    name: string
    meetings: Array<{
      id: string
      startsAt: string
      endsAt: string
      location: string
    }>
  }
}

export type EnrollmentCancellationResponse = {
  data: EnrollmentCancellation
}
