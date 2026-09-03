import { useState, type FormEvent } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/brand-mark'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/use-auth'
import { ApiError } from '../services/api-client'

type LocationState = { from?: { pathname?: string } }

export function AdminLoginPage() {
  const { user, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && user) return <Navigate to="/admin" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email, password })
      const destination = (location.state as LocationState | null)?.from?.pathname ?? '/admin'
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível entrar agora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[minmax(22rem,0.8fr)_1.2fr]">
      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link className="mb-10 inline-flex items-center gap-3 text-carbon no-underline" to="/">
            <BrandMark />
            <span className="font-display text-xl font-bold">Feito à Mão</span>
          </Link>

          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-ochre">Acesso administrativo</p>
          <h1 className="mb-3 font-display text-4xl font-bold leading-tight text-carbon sm:text-5xl">Entre na sua oficina.</h1>
          <p className="mb-8 max-w-sm leading-relaxed text-muted">Gerencie oficinas e acompanhe cada nova inscrição em um só lugar.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-carbon" htmlFor="email">E-mail</label>
              <input className="min-h-12 w-full rounded-sm border border-rule bg-light px-4 text-base text-ink transition placeholder:text-muted/60 hover:border-muted focus:border-blue" id="email" name="email" type="email" autoComplete="email" placeholder="admin@feitoamao.local" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-carbon" htmlFor="password">Senha</label>
              <input className="min-h-12 w-full rounded-sm border border-rule bg-light px-4 text-base text-ink transition placeholder:text-muted/60 hover:border-muted focus:border-blue" id="password" name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && <p className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
            <Button className="mt-2" size="full" type="submit" disabled={isSubmitting || isLoading}>{isSubmitting ? 'Entrando...' : 'Entrar no painel'}</Button>
          </form>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-carbon p-12 text-light lg:flex lg:flex-col lg:justify-between" aria-label="Mensagem da plataforma">
        <div className="absolute -right-24 -top-24 size-80 rounded-full border-[3rem] border-saffron/15" />
        <span className="relative font-mono text-xs uppercase tracking-wider text-saffron">Feito com cuidado</span>
        <blockquote className="relative max-w-xl">
          <p className="font-display text-5xl font-bold leading-tight xl:text-6xl">Cada inscrição é o começo de algo feito à mão.</p>
          <footer className="mt-8 border-l-2 border-saffron pl-4 text-light/65">Organize a agenda. Cuide das pessoas. Abra espaço para novos saberes.</footer>
        </blockquote>
        <p className="relative font-mono text-xs uppercase tracking-wider text-light/45">Painel de gestão · 2026</p>
      </aside>
    </main>
  )
}
