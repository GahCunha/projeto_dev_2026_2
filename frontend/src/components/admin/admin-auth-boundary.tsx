import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../../contexts/auth-provider'

export function AdminAuthBoundary() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
