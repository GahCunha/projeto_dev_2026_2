import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AdminClassCard } from '../components/admin/admin-class-card'
import { ClassFormPanel } from '../components/admin/class-form-panel'
import { ConfirmationDialog } from '../components/admin/confirmation-dialog'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import {
  createAdminClass,
  getAdminClasses,
  updateAdminClass,
  updateAdminClassStatus,
} from '../services/admin-class-service'
import type { ClassFormData, WorkshopClass } from '../types/workshop-class'

export function AdminClassesPage() {
  const { workshopId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const workshopTitle = searchParams.get('workshopTitle') ?? 'Oficina selecionada'
  const isNewWorkshop = searchParams.get('newWorkshop') === 'true'
  const [classes, setClasses] = useState<WorkshopClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [formClass, setFormClass] = useState<WorkshopClass | 'new' | null>(isNewWorkshop ? 'new' : null)
  const [statusClass, setStatusClass] = useState<WorkshopClass | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getAdminClasses(workshopId, controller.signal)
      .then((response) => {
        setClasses(response.data)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [requestKey, workshopId])

  const closeForm = useCallback(() => setFormClass(null), [])

  function refresh(message?: string) {
    if (message) setFeedback(message)
    setIsLoading(true)
    setError(null)
    setRequestKey((current) => current + 1)
  }

  async function saveClass(data: ClassFormData) {
    if (formClass === 'new') {
      await createAdminClass(workshopId, data)
      closeForm()
      refresh('Turma criada com todas as aulas informadas.')
      return
    }

    if (formClass) {
      await updateAdminClass(formClass.id, data)
      closeForm()
      refresh('Alterações da turma salvas com sucesso.')
    }
  }

  async function changeStatus() {
    if (!statusClass) return
    setIsUpdatingStatus(true)
    try {
      const nextActive = !statusClass.active
      await updateAdminClassStatus(statusClass.id, nextActive)
      setStatusClass(null)
      refresh(`Turma ${nextActive ? 'ativada' : 'desativada'} com sucesso.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível alterar o status.')
      setStatusClass(null)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link className="mb-5 inline-flex min-h-10 items-center font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" to="/admin/oficinas">← Voltar às oficinas</Link>

      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Agenda e disponibilidade</p>
          <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">Turmas</h1>
          <p className="mt-2 text-muted">{workshopTitle}</p>
        </div>
        <Button onClick={() => setFormClass('new')}>Criar turma</Button>
      </div>

      {isNewWorkshop && classes.length === 0 && !isLoading && !error && (
        <div className="mb-5 border-l-4 border-saffron bg-saffron/10 px-4 py-3 text-sm text-carbon" role="status">
          Oficina criada. Cadastre sua primeira turma para definir agenda, local, valor e vagas e torná-la visível ao público.
        </div>
      )}

      {feedback && <div className="mb-5 flex items-center justify-between gap-4 border-l-4 border-success bg-success/10 px-4 py-3 text-sm text-success" role="status"><span>{feedback}</span><button className="font-bold" type="button" onClick={() => setFeedback(null)} aria-label="Fechar mensagem">×</button></div>}

      {isLoading && <ClassGridSkeleton />}
      {!isLoading && error && <EmptyState title="Não foi possível carregar as turmas" description={error} role="alert" action={<Button onClick={() => refresh()}>Tentar novamente</Button>} />}
      {!isLoading && !error && classes.length === 0 && <EmptyState title="Esta oficina ainda não possui turmas" description="Crie uma turma para definir preço, vagas e as datas das aulas." action={<Button onClick={() => setFormClass('new')}>Criar primeira turma</Button>} />}
      {!isLoading && !error && classes.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {classes.map((workshopClass) => (
            <AdminClassCard key={workshopClass.id} workshopClass={workshopClass} workshopTitle={workshopTitle} onEdit={setFormClass} onStatusChange={setStatusClass} />
          ))}
        </div>
      )}

      {formClass && <ClassFormPanel workshopTitle={workshopTitle} workshopClass={formClass === 'new' ? undefined : formClass} onSubmit={saveClass} onClose={closeForm} />}
      {statusClass && <ConfirmationDialog title={`${statusClass.active ? 'Desativar' : 'Ativar'} “${statusClass.name}”?`} description={statusClass.active ? 'Ela deixará de aparecer na área pública, mas suas inscrições serão preservadas.' : 'Ela voltará a aceitar inscrições se ainda possuir aulas futuras e vagas.'} confirmLabel={statusClass.active ? 'Desativar turma' : 'Ativar turma'} isSubmitting={isUpdatingStatus} onConfirm={changeStatus} onClose={() => setStatusClass(null)} />}
    </div>
  )
}

function ClassGridSkeleton() {
  return <div className="grid gap-5 lg:grid-cols-2" role="status" aria-label="Carregando turmas">{[1, 2].map((item) => <div className="space-y-4 border border-rule bg-paper p-5" key={item}><div className="loading-surface h-5 w-1/2 animate-loading" /><div className="loading-surface h-24 animate-loading" /><div className="loading-surface h-16 animate-loading" /></div>)}<span className="sr-only">Carregando turmas...</span></div>
}
