import type {
  AdminWorkshopFilters,
  AdminWorkshopResponse,
  AdminWorkshopsResponse,
  WorkshopFormData,
} from '../types/workshop'
import { apiRequest } from './api-client'

export function getAdminWorkshops(filters: AdminWorkshopFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize ?? 10),
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.active !== undefined) params.set('active', String(filters.active))

  return apiRequest<AdminWorkshopsResponse>(`/api/admin/oficinas?${params}`, { signal })
}

export function createAdminWorkshop(data: WorkshopFormData) {
  return apiRequest<AdminWorkshopResponse>('/api/admin/oficinas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateAdminWorkshop(id: string, data: WorkshopFormData) {
  return apiRequest<AdminWorkshopResponse>(`/api/admin/oficinas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateAdminWorkshopStatus(id: string, active: boolean) {
  return apiRequest<AdminWorkshopResponse>(`/api/admin/oficinas/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  })
}
