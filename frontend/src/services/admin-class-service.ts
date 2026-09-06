import type {
  ClassFormData,
  WorkshopClassesResponse,
  WorkshopClassResponse,
} from '../types/workshop-class'
import { apiRequest } from './api-client'

export function getAdminClasses(workshopId: string, signal?: AbortSignal) {
  return apiRequest<WorkshopClassesResponse>(
    `/api/admin/oficinas/${workshopId}/turmas`,
    { signal },
  )
}

export function createAdminClass(workshopId: string, data: ClassFormData) {
  return apiRequest<WorkshopClassResponse>(
    `/api/admin/oficinas/${workshopId}/turmas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
}

export function updateAdminClass(id: string, data: ClassFormData) {
  return apiRequest<WorkshopClassResponse>(`/api/admin/turmas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateAdminClassStatus(id: string, active: boolean) {
  return apiRequest<WorkshopClassResponse>(`/api/admin/turmas/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  })
}
