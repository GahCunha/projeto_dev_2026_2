import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminPagination } from '../components/admin/admin-pagination'
import { ConfirmationDialog } from '../components/admin/confirmation-dialog'
import { EnrollmentsTable } from '../components/admin/enrollments-table'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { getAdminEnrollments, updateAdminEnrollmentStatus } from '../services/admin-enrollment-service'
import type { AdminEnrollment, EnrollmentPagination, EnrollmentStatus } from '../types/enrollment'

const validStatuses: EnrollmentStatus[] = ['PENDENTE', 'CONFIRMADA', 'CANCELADA']
type NextEnrollmentStatus = Extract<EnrollmentStatus, 'CONFIRMADA' | 'CANCELADA'>
type PendingStatusChange = { enrollment: AdminEnrollment; status: NextEnrollmentStatus }

const initialPagination: EnrollmentPagination = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
}

export function AdminEnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const statusParam = searchParams.get('status') as EnrollmentStatus | null
  const status = statusParam && validStatuses.includes(statusParam) ? statusParam : undefined
  const workshopId = searchParams.get('workshopId') ?? undefined
  const workshopTitle = searchParams.get('workshopTitle') ?? undefined
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchInput, setSearchInput] = useState(search)
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [pagination, setPagination] = useState(initialPagination)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null)
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    getAdminEnrollments({ search: search || undefined, status, workshopId, page }, controller.signal)
      .then((response) => {
        setEnrollments(response.data)
        setPagination(response.pagination)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [page, requestKey, search, status, workshopId])

  function updateFilters(values: { search?: string; status?: EnrollmentStatus | null; page?: number }) {
    const nextParams = new URLSearchParams()
    const nextSearch = values.search ?? search
    const nextStatus = values.status === undefined ? status : values.status ?? undefined
    const nextPage = values.page ?? 1

    if (nextSearch) nextParams.set('search', nextSearch)
    if (nextStatus) nextParams.set('status', nextStatus)
    if (workshopId) nextParams.set('workshopId', workshopId)
    if (workshopTitle) nextParams.set('workshopTitle', workshopTitle)
    if (nextPage > 1) nextParams.set('page', String(nextPage))

    if (nextParams.toString() === searchParams.toString()) return

    setIsLoading(true)
    setError(null)
    setFeedback(null)
    setSearchParams(nextParams)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateFilters({ search: searchInput.trim(), page: 1 })
  }

  function clearFilters() {
    setSearchInput('')
    setIsLoading(true)
    setError(null)
    setFeedback(null)
    setSearchParams(new URLSearchParams())
  }

  function retry() {
    setIsLoading(true)
    setError(null)
    setRequestKey((key) => key + 1)
  }

  async function changeEnrollmentStatus() {
    if (!pendingStatusChange) return

    const { enrollment, status: nextStatus } = pendingStatusChange
    setUpdatingEnrollmentId(enrollment.id)
    try {
      await updateAdminEnrollmentStatus(enrollment.id, nextStatus)
      setPendingStatusChange(null)
      setFeedback(`Inscrição de ${enrollment.name} ${nextStatus === 'CONFIRMADA' ? 'confirmada' : 'cancelada'} com sucesso.`)
      setIsLoading(true)
      setRequestKey((key) => key + 1)
    } catch (requestError) {
      setPendingStatusChange(null)
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível alterar a inscrição.')
    } finally {
      setUpdatingEnrollmentId(undefined)
    }
  }

  const hasFilters = Boolean(search || status || workshopId)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Gestão de participantes</p>
          <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">Inscrições</h1>
          <p className="mt-2 text-muted">Encontre participantes e acompanhe o andamento de cada vaga.</p>
        </div>
        {!isLoading && !error && <p className="font-mono text-xs uppercase tracking-wider text-muted">{pagination.totalItems} {pagination.totalItems === 1 ? 'registro' : 'registros'}</p>}
      </div>

      {feedback && (
        <div className="mb-5 flex items-center justify-between gap-4 border-l-4 border-success bg-success/10 px-4 py-3 text-sm text-success" role="status">
          <span>{feedback}</span>
          <button className="min-h-10 px-2 font-bold" type="button" onClick={() => setFeedback(null)} aria-label="Fechar mensagem">×</button>
        </div>
      )}

      {workshopId && (
        <div className="mb-5 flex flex-col gap-3 border-l-4 border-saffron bg-saffron/10 px-4 py-3 text-sm text-carbon sm:flex-row sm:items-center sm:justify-between">
          <p>
            Inscrições da oficina <strong>{workshopTitle ? `“${workshopTitle}”` : 'selecionada'}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button className="font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" type="button" onClick={clearFilters}>Limpar filtros</button>
            <Link className="shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" to="/admin/oficinas">Voltar às oficinas</Link>
          </div>
        </div>
      )}

      <form className="mb-5 grid gap-3 border border-rule bg-paper p-4 sm:grid-cols-[1fr_13rem_auto]" onSubmit={handleSearch}>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted" htmlFor="enrollment-search">Buscar participante</label>
          <input className="min-h-11 w-full rounded-sm border border-rule bg-light px-3 text-sm text-ink placeholder:text-muted/60 hover:border-muted" id="enrollment-search" type="search" placeholder="Nome ou e-mail" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted" htmlFor="enrollment-status">Status</label>
          <select className="min-h-11 w-full rounded-sm border border-rule bg-light px-3 text-sm text-ink hover:border-muted" id="enrollment-status" value={status ?? ''} onChange={(event) => updateFilters({ status: event.target.value ? event.target.value as EnrollmentStatus : null, page: 1 })}>
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
        <Button className="self-end" type="submit">Buscar</Button>
      </form>

      {isLoading && <EnrollmentTableSkeleton />}

      {!isLoading && error && (
        <EmptyState title="Não foi possível carregar as inscrições" description={error} role="alert" action={<Button onClick={retry}>Tentar novamente</Button>} />
      )}

      {!isLoading && !error && enrollments.length === 0 && (
        <EmptyState
          title={hasFilters ? 'Nenhuma inscrição encontrada' : 'Ainda não há inscrições'}
          description={hasFilters ? 'Tente mudar os termos da busca ou remover os filtros.' : 'Quando alguém se inscrever em uma oficina, os dados aparecerão aqui.'}
          action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button> : undefined}
        />
      )}

      {!isLoading && !error && enrollments.length > 0 && (
        <>
          <EnrollmentsTable enrollments={enrollments} updatingEnrollmentId={updatingEnrollmentId} onStatusChange={(enrollment, nextStatus) => setPendingStatusChange({ enrollment, status: nextStatus })} />
          <AdminPagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} onPageChange={(nextPage) => updateFilters({ page: nextPage })} />
        </>
      )}

      {pendingStatusChange && (
        <ConfirmationDialog
          title={`${pendingStatusChange.status === 'CONFIRMADA' ? 'Confirmar' : 'Cancelar'} inscrição de ${pendingStatusChange.enrollment.name}?`}
          description={pendingStatusChange.status === 'CONFIRMADA'
            ? `A vaga em “${pendingStatusChange.enrollment.workshop.title}” será confirmada para esta pessoa.`
            : `A vaga em “${pendingStatusChange.enrollment.workshop.title}” será liberada e esta ação não poderá ser desfeita.`}
          confirmLabel={pendingStatusChange.status === 'CONFIRMADA' ? 'Confirmar inscrição' : 'Cancelar inscrição'}
          isSubmitting={updatingEnrollmentId === pendingStatusChange.enrollment.id}
          onConfirm={changeEnrollmentStatus}
          onClose={() => setPendingStatusChange(null)}
        />
      )}
    </div>
  )
}

function EnrollmentTableSkeleton() {
  return (
    <div className="overflow-hidden border border-rule bg-paper" aria-label="Carregando inscrições" role="status">
      <div className="h-11 border-b border-rule bg-deep/55" />
      {[1, 2, 3, 4].map((item) => (
        <div className="grid grid-cols-3 gap-6 border-b border-rule/70 px-5 py-5 last:border-0" key={item}>
          <span className="loading-surface h-4 animate-loading rounded-sm" />
          <span className="loading-surface h-4 animate-loading rounded-sm" />
          <span className="loading-surface h-4 animate-loading rounded-sm" />
        </div>
      ))}
      <span className="sr-only">Carregando inscrições...</span>
    </div>
  )
}
