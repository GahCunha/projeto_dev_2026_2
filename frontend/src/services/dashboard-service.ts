import type { DashboardSummaryResponse } from '../types/dashboard'
import { apiRequest } from './api-client'

export function getDashboardSummary(signal?: AbortSignal) {
  return apiRequest<DashboardSummaryResponse>('/api/admin/resumo', { signal })
}
