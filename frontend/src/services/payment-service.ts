import type { EnrollmentPaymentResponse } from '../types/payment'
import { apiRequest } from './api-client'

export function getEnrollmentPayment(token: string, signal?: AbortSignal) {
  return apiRequest<EnrollmentPaymentResponse>(`/api/inscricoes/pagamento/${token}`, { signal })
}

export function simulateEnrollmentPayment(token: string) {
  return apiRequest<EnrollmentPaymentResponse>(`/api/inscricoes/pagamento/${token}`, { method: 'POST' })
}
