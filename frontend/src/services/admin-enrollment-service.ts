import type { AdminEnrollmentFilters, AdminEnrollmentsResponse } from '../types/enrollment'
import { apiRequest } from './api-client'

export function getAdminEnrollments(filters: AdminEnrollmentFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize ?? 10),
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)

  return apiRequest<AdminEnrollmentsResponse>(`/api/admin/inscricoes?${params}`, { signal })
}
