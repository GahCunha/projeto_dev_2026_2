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
