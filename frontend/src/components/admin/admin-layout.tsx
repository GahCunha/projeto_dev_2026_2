import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { cn } from '../../lib/utils'
import { BrandMark } from '../brand-mark'

const navigation = [
  { label: 'Visão geral', to: '/admin', end: true },
  { label: 'Inscrições', to: '/admin/inscricoes' },
  { label: 'Oficinas', to: '/admin/oficinas' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-light lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-rule bg-carbon text-light lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 lg:px-6 lg:py-6">
            <Link className="flex items-center gap-3 text-light no-underline" to="/admin">
              <BrandMark />
              <span>
                <strong className="block font-display text-lg leading-none">Feito à Mão</strong>
                <small className="font-mono text-xs uppercase tracking-wider text-light/65">Administração</small>
              </span>
            </Link>
            <Link className="font-mono text-xs uppercase tracking-wider text-light/70 hover:text-white lg:hidden" to="/">Ver site</Link>
          </div>

          <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:p-4" aria-label="Navegação administrativa">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  'whitespace-nowrap border-l-2 px-4 py-3 text-sm font-bold text-light/70 no-underline transition hover:bg-white/10 hover:text-white',
                  isActive && 'border-saffron bg-white/10 text-white',
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden border-t border-white/15 p-5 lg:block">
            <p className="mb-1 truncate text-sm font-bold">{user?.name}</p>
            <p className="mb-4 truncate text-xs text-light/60">{user?.email}</p>
            <button
              className="font-mono text-xs uppercase tracking-wider text-light/70 underline decoration-saffron underline-offset-4 hover:text-white disabled:opacity-50"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Saindo...' : 'Sair do painel'}
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-rule bg-paper px-5 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Painel administrativo</p>
          <div className="flex items-center gap-5">
            <Link className="hidden text-sm font-bold text-blue sm:block" to="/">Abrir área pública</Link>
            <button className="text-sm font-bold text-danger lg:hidden" type="button" onClick={handleLogout}>Sair</button>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><Outlet /></main>
      </div>
    </div>
  )
}
