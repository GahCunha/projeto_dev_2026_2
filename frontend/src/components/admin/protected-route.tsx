import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-muted">
          <span className="size-3 animate-pulse rounded-full bg-saffron" />
          Verificando acesso
        </div>
      </main>
    )
  }

  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <Outlet />
}
