import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminPagination } from '../components/admin/admin-pagination'
import { AdminWorkshopCard } from '../components/admin/admin-workshop-card'
import { ConfirmationDialog } from '../components/admin/confirmation-dialog'
import { WorkshopFormPanel } from '../components/admin/workshop-form-panel'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import {
  createAdminWorkshop,
  getAdminWorkshops,
  updateAdminWorkshop,
  updateAdminWorkshopStatus,
} from '../services/admin-workshop-service'
import type { AdminWorkshop, WorkshopFormData, WorkshopPagination } from '../types/workshop'

const initialPagination: WorkshopPagination = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 }

export function AdminWorkshopsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const activeParam = searchParams.get('active')
  const active = activeParam === 'true' ? true : activeParam === 'false' ? false : undefined
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchInput, setSearchInput] = useState(search)
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([])
  const [pagination, setPagination] = useState(initialPagination)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [formWorkshop, setFormWorkshop] = useState<AdminWorkshop | 'new' | null>(null)
  const [statusWorkshop, setStatusWorkshop] = useState<AdminWorkshop | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getAdminWorkshops({ search: search || undefined, active, page }, controller.signal)
      .then((response) => {
        setWorkshops(response.data)
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
  }, [active, page, requestKey, search])

  const closeForm = useCallback(() => setFormWorkshop(null), [])

  function refresh(message?: string) {
    if (message) setFeedback(message)
    setIsLoading(true)
    setRequestKey((key) => key + 1)
  }

  function updateFilters(values: { search?: string; active?: boolean | null; page?: number }) {
    const nextParams = new URLSearchParams()
    const nextSearch = values.search ?? search
    const nextActive = values.active === undefined ? active : values.active ?? undefined
    const nextPage = values.page ?? 1
    if (nextSearch) nextParams.set('search', nextSearch)
    if (nextActive !== undefined) nextParams.set('active', String(nextActive))
    if (nextPage > 1) nextParams.set('page', String(nextPage))
    if (nextParams.toString() === searchParams.toString()) return
    setFeedback(null)
    setIsLoading(true)
    setError(null)
    setSearchParams(nextParams)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateFilters({ search: searchInput.trim(), page: 1 })
  }

  function clearFilters() {
    setSearchInput('')
    setFeedback(null)
    setIsLoading(true)
    setError(null)
    setSearchParams(new URLSearchParams())
  }

  async function saveWorkshop(data: WorkshopFormData) {
    if (formWorkshop === 'new') {
      await createAdminWorkshop(data)
      closeForm()
      refresh('Oficina criada e publicada com sucesso.')
      return
    }
    if (formWorkshop) {
      await updateAdminWorkshop(formWorkshop.id, data)
      closeForm()
      refresh('Alterações da oficina salvas com sucesso.')
    }
  }

  async function changeStatus() {
    if (!statusWorkshop) return
    setIsUpdatingStatus(true)
    try {
      const nextActive = !statusWorkshop.active
      await updateAdminWorkshopStatus(statusWorkshop.id, nextActive)
      setStatusWorkshop(null)
      refresh(`Oficina ${nextActive ? 'ativada' : 'desativada'} com sucesso.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível alterar o status.')
      setStatusWorkshop(null)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const hasFilters = Boolean(search || active !== undefined)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Catálogo de experiências</p>
          <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">Oficinas</h1>
          <p className="mt-2 text-muted">Organize a agenda e escolha o que está disponível ao público.</p>
        </div>
        <Button onClick={() => setFormWorkshop('new')}>Criar oficina</Button>
      </div>

      {feedback && <div className="mb-5 flex items-center justify-between gap-4 border-l-4 border-success bg-success/10 px-4 py-3 text-sm text-success" role="status"><span>{feedback}</span><button className="font-bold" type="button" onClick={() => setFeedback(null)} aria-label="Fechar mensagem">×</button></div>}

      <form className="mb-5 grid gap-3 border border-rule bg-paper p-4 sm:grid-cols-[1fr_13rem_auto]" onSubmit={handleSearch}>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted" htmlFor="workshop-search">Buscar oficina</label>
          <input className="min-h-11 w-full rounded-sm border border-rule bg-light px-3 text-sm text-ink placeholder:text-muted/60 hover:border-muted" id="workshop-search" type="search" placeholder="Título ou local" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted" htmlFor="workshop-active">Publicação</label>
          <select className="min-h-11 w-full rounded-sm border border-rule bg-light px-3 text-sm text-ink hover:border-muted" id="workshop-active" value={active === undefined ? '' : String(active)} onChange={(event) => updateFilters({ active: event.target.value === '' ? null : event.target.value === 'true', page: 1 })}>
            <option value="">Ativas e inativas</option>
            <option value="true">Somente ativas</option>
            <option value="false">Somente inativas</option>
          </select>
        </div>
        <Button className="self-end" type="submit">Buscar</Button>
      </form>

      {isLoading && <WorkshopGridSkeleton />}
      {!isLoading && error && <EmptyState title="Não foi possível carregar as oficinas" description={error} role="alert" action={<Button onClick={() => refresh()}>Tentar novamente</Button>} />}
      {!isLoading && !error && workshops.length === 0 && <EmptyState title={hasFilters ? 'Nenhuma oficina encontrada' : 'Ainda não há oficinas'} description={hasFilters ? 'Tente mudar a busca ou remover os filtros.' : 'Crie a primeira experiência para começar a receber inscrições.'} action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button> : <Button onClick={() => setFormWorkshop('new')}>Criar oficina</Button>} />}
      {!isLoading && !error && workshops.length > 0 && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workshops.map((workshop) => <AdminWorkshopCard key={workshop.id} workshop={workshop} onEdit={setFormWorkshop} onStatusChange={setStatusWorkshop} />)}
          </div>
          <AdminPagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} onPageChange={(nextPage) => updateFilters({ page: nextPage })} />
        </>
      )}

      {formWorkshop && <WorkshopFormPanel workshop={formWorkshop === 'new' ? undefined : formWorkshop} onSubmit={saveWorkshop} onClose={closeForm} />}
      {statusWorkshop && <ConfirmationDialog title={`${statusWorkshop.active ? 'Desativar' : 'Ativar'} “${statusWorkshop.title}”?`} description={statusWorkshop.active ? 'Ela deixará de aparecer na área pública, mas as inscrições existentes serão preservadas.' : 'Ela voltará a aparecer na área pública se a data ainda estiver disponível.'} confirmLabel={statusWorkshop.active ? 'Desativar oficina' : 'Ativar oficina'} isSubmitting={isUpdatingStatus} onConfirm={changeStatus} onClose={() => setStatusWorkshop(null)} />}
    </div>
  )
}

function WorkshopGridSkeleton() {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Carregando oficinas">{[1, 2, 3].map((item) => <div className="overflow-hidden border border-rule bg-paper" key={item}><div className="loading-surface aspect-[16/7] animate-loading" /><div className="space-y-4 p-5"><div className="loading-surface h-3 w-1/3 animate-loading" /><div className="loading-surface h-6 w-3/4 animate-loading" /><div className="loading-surface h-16 animate-loading" /></div></div>)}<span className="sr-only">Carregando oficinas...</span></div>
}
