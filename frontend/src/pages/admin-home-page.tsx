import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EnrollmentStatusBadge } from '../components/admin/enrollment-status-badge'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { useAuth } from '../hooks/use-auth'
import { getDashboardSummary } from '../services/dashboard-service'
import type { DashboardSummary } from '../types/dashboard'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function AdminHomePage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary>()
  const [error, setError] = useState<string>()
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getDashboardSummary(controller.signal)
      .then((response) => {
        setSummary(response.data)
        setError(undefined)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError')
          setError(requestError.message)
      })
    return () => controller.abort()
  }, [requestKey])

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 border-b border-rule pb-6">
        <p className="mb-2 font-mono text-xs tracking-wider text-ochre uppercase">
          Visão geral
        </p>
        <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">
          Olá, {user?.name.split(' ')[0]}.
        </h1>
        <p className="mt-2 text-muted">
          Veja o movimento do ateliê e o que precisa da sua atenção.
        </p>
      </header>
      {!summary && !error && <DashboardSkeleton />}
      {!summary && error && (
        <EmptyState
          title="Não foi possível carregar o resumo"
          description={error}
          role="alert"
          action={
            <Button onClick={() => setRequestKey((current) => current + 1)}>
              Tentar novamente
            </Button>
          }
        />
      )}
      {summary && <DashboardContent summary={summary} />}
    </div>
  )
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const { metrics } = summary
  const occupancy =
    metrics.totalCapacity === 0
      ? 0
      : Math.round((metrics.occupiedSeats / metrics.totalCapacity) * 100)
  return (
    <div className="space-y-7">
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Pendências">
        <AttentionCard
          value={metrics.pendingEnrollments}
          label="inscrições aguardando confirmação"
          to="/admin/inscricoes?status=PENDENTE"
          action="Revisar inscrições"
        />
        <AttentionCard
          value={metrics.pendingPayments}
          label="pagamentos aguardando"
          to="/admin/inscricoes?paymentStatus=PENDENTE"
          action="Acompanhar pagamentos"
        />
      </section>

      <section aria-labelledby="numbers-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2
            className="font-display text-xl font-bold text-carbon"
            id="numbers-title"
          >
            Movimento do ateliê
          </h2>
          <span className="font-mono text-xs tracking-wider text-muted uppercase">
            Agora
          </span>
        </div>
        <dl className="grid border border-rule bg-paper shadow-craft-sm sm:grid-cols-2 lg:grid-cols-4">
          <Metric value={metrics.activeWorkshops} label="Oficinas ativas" />
          <Metric value={metrics.upcomingClasses} label="Próximas turmas" />
          <Metric
            value={`${metrics.occupiedSeats}/${metrics.totalCapacity}`}
            label={`Vagas ocupadas · ${occupancy}%`}
          />
          <Metric value={metrics.availableSeats} label="Vagas disponíveis" />
        </dl>
      </section>

      <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
        <OccupancyChart workshops={summary.occupancyByWorkshop} />
        <RecentEnrollments enrollments={summary.recentEnrollments} />
      </div>
      <nav className="grid gap-3 sm:grid-cols-2" aria-label="Acessos rápidos">
        <QuickLink to="/admin/oficinas" label="Organizar oficinas e turmas" />
        <QuickLink to="/admin/inscricoes" label="Ver todas as inscrições" />
      </nav>
    </div>
  )
}

function AttentionCard({
  value,
  label,
  to,
  action,
}: {
  value: number
  label: string
  to: string
  action: string
}) {
  return (
    <Link
      className={`group flex items-center justify-between gap-4 border-l-4 bg-paper px-5 py-4 no-underline shadow-craft-sm transition hover:-translate-y-0.5 ${value > 0 ? 'border-ochre' : 'border-success'}`}
      to={to}
    >
      <span className="flex items-baseline gap-3">
        <strong className="font-display text-3xl text-carbon tabular-nums">
          {value}
        </strong>
        <span className="text-sm text-muted">{label}</span>
      </span>
      <span className="shrink-0 font-mono text-xs font-bold tracking-wider text-blue uppercase">
        {action} →
      </span>
    </Link>
  )
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="sm:nth-even:border-l border-rule p-5 lg:not-first:border-l">
      <dd className="font-display text-3xl font-bold text-carbon tabular-nums">
        {value}
      </dd>
      <dt className="mt-1 font-mono text-xs tracking-wider text-muted uppercase">
        {label}
      </dt>
    </div>
  )
}

function OccupancyChart({
  workshops,
}: {
  workshops: DashboardSummary['occupancyByWorkshop']
}) {
  return (
    <section
      className="border border-rule bg-paper p-5 shadow-craft-sm sm:p-6"
      aria-labelledby="occupancy-title"
    >
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-rule pb-4">
        <div>
          <p className="font-mono text-xs tracking-wider text-ochre uppercase">
            Capacidade
          </p>
          <h2
            className="mt-1 font-display text-xl font-bold text-carbon"
            id="occupancy-title"
          >
            Ocupação por oficina
          </h2>
        </div>
        <Link className="text-xs font-bold text-blue" to="/admin/oficinas">
          Ver oficinas
        </Link>
      </div>
      {workshops.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma oficina possui turma futura ativa.
        </p>
      ) : (
        <ul className="space-y-5">
          {workshops.map((workshop) => (
            <li key={workshop.id}>
              <div className="mb-2 flex items-end justify-between gap-4 text-sm">
                <span className="truncate font-bold text-carbon">
                  {workshop.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted tabular-nums">
                  {workshop.occupiedSeats}/{workshop.totalCapacity} ·{' '}
                  {workshop.occupancyPercentage}%
                </span>
              </div>
              <div
                className="h-3 overflow-hidden border border-rule bg-deep"
                role="progressbar"
                aria-label={`Ocupação de ${workshop.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={workshop.occupancyPercentage}
              >
                <div
                  className={`h-full ${workshop.occupancyPercentage >= 90 ? 'bg-danger' : 'bg-green'}`}
                  style={{ width: `${workshop.occupancyPercentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentEnrollments({
  enrollments,
}: {
  enrollments: DashboardSummary['recentEnrollments']
}) {
  return (
    <section
      className="border border-rule bg-paper p-5 shadow-craft-sm sm:p-6"
      aria-labelledby="recent-title"
    >
      <div className="mb-4 border-b border-rule pb-4">
        <p className="font-mono text-xs tracking-wider text-ochre uppercase">
          Chegaram agora
        </p>
        <h2
          className="mt-1 font-display text-xl font-bold text-carbon"
          id="recent-title"
        >
          Inscrições recentes
        </h2>
      </div>
      {enrollments.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma inscrição recebida ainda.</p>
      ) : (
        <ol className="divide-y divide-rule/70">
          {enrollments.map((enrollment) => (
            <li className="py-3 first:pt-0 last:pb-0" key={enrollment.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-carbon">
                    {enrollment.name}
                  </strong>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {enrollment.workshop.title}
                  </span>
                </div>
                <EnrollmentStatusBadge status={enrollment.status} />
              </div>
              <time
                className="mt-2 block font-mono text-xs text-muted"
                dateTime={enrollment.createdAt}
              >
                {dateFormatter.format(new Date(enrollment.createdAt))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      className="flex min-h-12 items-center justify-between border border-rule bg-paper px-5 font-mono text-xs font-bold tracking-wider text-blue uppercase no-underline transition hover:border-carbon"
      to={to}
    >
      {label} <span aria-hidden="true">→</span>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7" role="status" aria-label="Carregando resumo">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 animate-loading loading-surface" />
        <div className="h-20 animate-loading loading-surface" />
      </div>
      <div className="h-28 animate-loading loading-surface" />
      <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="h-96 animate-loading loading-surface" />
        <div className="h-96 animate-loading loading-surface" />
      </div>
      <span className="sr-only">Carregando resumo administrativo...</span>
    </div>
  )
}
