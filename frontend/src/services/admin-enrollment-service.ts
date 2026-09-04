import type {
  AdminEnrollmentFilters,
  AdminEnrollmentsResponse,
  EnrollmentResponse,
  EnrollmentStatus,
} from '../types/enrollment'
import { apiRequest } from './api-client'

export function getAdminEnrollments(filters: AdminEnrollmentFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize ?? 10),
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.workshopId) params.set('workshopId', filters.workshopId)

  return apiRequest<AdminEnrollmentsResponse>(`/api/admin/inscricoes?${params}`, { signal })
}

export function updateAdminEnrollmentStatus(id: string, status: Extract<EnrollmentStatus, 'CONFIRMADA' | 'CANCELADA'>) {
  return apiRequest<EnrollmentResponse>(`/api/admin/inscricoes/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
