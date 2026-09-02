import type { CreateEnrollmentInput, EnrollmentResponse } from '../types/enrollment'
import { apiRequest } from './api-client'

export function createEnrollment(data: CreateEnrollmentInput) {
  return apiRequest<EnrollmentResponse>('/api/inscricoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
