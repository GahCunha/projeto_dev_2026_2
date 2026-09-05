import type { EnrollmentCancellationResponse } from '../types/cancellation'
import { apiRequest } from './api-client'

export function getEnrollmentCancellation(token: string, signal?: AbortSignal) {
  return apiRequest<EnrollmentCancellationResponse>(`/api/inscricoes/cancelamento/${token}`, { signal })
}

export function cancelEnrollment(token: string) {
  return apiRequest<EnrollmentCancellationResponse>(`/api/inscricoes/cancelamento/${token}`, {
    method: 'POST',
  })
}
