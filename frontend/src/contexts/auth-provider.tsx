import { useEffect, useState, type ReactNode } from 'react'
import * as authService from '../services/auth-service'
import type { AdminUser, LoginCredentials } from '../types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser()
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials)
    setUser(response.data)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}
