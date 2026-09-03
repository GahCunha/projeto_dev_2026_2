import type { AdminUser, LoginCredentials } from '../types/auth'
import { apiRequest } from './api-client'

type AuthResponse = { data: AdminUser }

export function getCurrentUser() {
  return apiRequest<AuthResponse>('/api/admin/auth/me')
}

export function login(credentials: LoginCredentials) {
  return apiRequest<AuthResponse>('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
}

export function logout() {
  return apiRequest<void>('/api/admin/auth/logout', { method: 'POST' })
}
