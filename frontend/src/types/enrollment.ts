export type CreateEnrollmentInput = {
  name: string
  email: string
  workshopId: string
}

export type Enrollment = {
  id: string
  name: string
  email: string
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA'
  workshopId: string
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
  page: number
  pageSize?: number
}
