export type CreateEnrollmentInput = {
  name: string
  email: string
  classId: string
}

export type Enrollment = {
  id: string
  name: string
  email: string
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA'
  workshopId: string
  classId: string
  createdAt: string
  updatedAt: string
}

export type EnrollmentResponse = {
  data: Enrollment
}

export type EnrollmentStatus = Enrollment['status']

export type AdminEnrollment = Enrollment & {
  workshop: {
    id: string
    title: string
    startsAt: string
    active: boolean
  }
  class: {
    id: string
    name: string
    capacity: number
    price: number
    active: boolean
    meetings: Array<{
      id: string
      startsAt: string
      endsAt: string
      location: string
    }>
  } | null
}

export type EnrollmentPagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type AdminEnrollmentsResponse = {
  data: AdminEnrollment[]
  pagination: EnrollmentPagination
}

export type AdminEnrollmentFilters = {
  search?: string
  status?: EnrollmentStatus
  workshopId?: string
  classId?: string
  page: number
  pageSize?: number
}
