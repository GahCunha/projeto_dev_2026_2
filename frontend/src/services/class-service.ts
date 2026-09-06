import type { WorkshopClassesResponse } from '../types/workshop-class'
import { apiRequest } from './api-client'

export function getWorkshopClasses(workshopId: string, signal?: AbortSignal) {
  return apiRequest<WorkshopClassesResponse>(
    `/api/oficinas/${workshopId}/turmas`,
    { signal },
  )
}
