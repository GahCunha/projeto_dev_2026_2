import type { WorkshopsResponse } from '../types/workshop'
import { apiRequest } from './api-client'

export function getWorkshops(signal?: AbortSignal) {
  return apiRequest<WorkshopsResponse>('/api/oficinas', { signal })
}
