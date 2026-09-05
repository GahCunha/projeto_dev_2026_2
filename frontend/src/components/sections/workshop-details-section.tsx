import { useEffect, useState } from 'react'
import { pagePadding } from '../../lib/styles'
import { getWorkshopClasses } from '../../services/class-service'
import type { WorkshopClass } from '../../types/workshop-class'
import type { Workshop } from '../../types/workshop'
import { ClassPicker } from '../class-picker'
import { EnrollmentForm } from '../enrollment-form'
import { Button } from '../ui/button'
import { ImageFallback } from '../ui/image-fallback'

type WorkshopDetailsSectionProps = {
  workshop: Workshop
  onClose: () => void
  onEnrollmentCreated: () => void
}

export function WorkshopDetailsSection({ workshop, onClose, onEnrollmentCreated }: WorkshopDetailsSectionProps) {
  const [classes, setClasses] = useState<WorkshopClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null

  useEffect(() => {
    const controller = new AbortController()

    getWorkshopClasses(workshop.id, controller.signal)
      .then((response) => {
        setClasses(response.data)
        setSelectedClassId(
          response.data.find((item) => item.availableSeats > 0)?.id ?? null,
        )
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
  }, [workshop.id, requestKey])

  function refreshClasses() {
    onEnrollmentCreated()
    setIsLoading(true)
    setError(null)
    setRequestKey((current) => current + 1)
  }

  function retryClasses() {
    setIsLoading(true)
    setError(null)
    setRequestKey((current) => current + 1)
  }

  return (
    <section className={`grid scroll-mt-18 grid-cols-1 gap-10 border-t border-rule py-12 lg:grid-cols-5 lg:gap-20 lg:py-20 ${pagePadding}`} id="detalhes" aria-labelledby="selected-workshop-title">
      <div className="lg:col-span-3">
        <Button className="mb-8" variant="ghost" onClick={onClose}>← Voltar para oficinas</Button>

        <div className="relative mb-10 h-80 border border-carbon bg-light p-2 shadow-offset sm:h-96 md:h-116">
          {workshop.imageUrl ? <img className="block h-full w-full object-cover" src={workshop.imageUrl} alt={`Oficina ${workshop.title}`} width="960" height="640" loading="lazy" /> : <ImageFallback />}
          <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm" aria-hidden="true" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="justify-self-start bg-green px-2.5 py-1.5 font-mono text-xs uppercase tracking-widest text-white">{workshop.category}</span>
          <h2 className="my-3 mb-6 w-full font-display text-4xl leading-none -tracking-wider text-carbon md:text-6xl" id="selected-workshop-title">{workshop.title}</h2>
        </div>

        <p className="my-8 text-lg leading-relaxed text-muted">{workshop.description}</p>

        <div className="my-10 border-y border-rule py-8">
          {isLoading && <div className="loading-surface animate-loading h-40 border border-rule" aria-label="Carregando turmas" />}
          {!isLoading && error && (
            <div className="grid gap-3 border-l-4 border-danger bg-deep p-4" role="alert">
              <p className="m-0">{error}</p>
              <Button className="justify-self-start" variant="ghost" onClick={retryClasses}>Tentar novamente</Button>
            </div>
          )}
          {!isLoading && !error && classes.length === 0 && (
            <p className="m-0 text-muted">Esta oficina ainda não possui turmas disponíveis.</p>
          )}
          {!isLoading && !error && classes.length > 0 && (
            <ClassPicker classes={classes} selectedClassId={selectedClassId} onSelect={setSelectedClassId} />
          )}
        </div>

        <div className="relative mt-12 border border-rule bg-deep px-6 pt-8 pb-5">
          <span className="absolute -top-3 left-5 bg-paper px-2 py-1 font-mono text-xs uppercase tracking-widest text-blue">Lista de materiais</span>
          {workshop.materials.length > 0 ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {workshop.materials.map((material) => (
                <li className="flex gap-3" key={material}><span className="grid size-5 shrink-0 place-items-center border border-green text-xs text-green" aria-hidden="true">✓</span>{material}</li>
              ))}
            </ul>
          ) : <p>Nenhum material precisa ser levado.</p>}
        </div>
      </div>

      <aside className="relative self-start shadow-craft lg:col-span-2 lg:mt-14">
        {selectedClass ? (
          <EnrollmentForm key={selectedClass.id} classId={selectedClass.id} hasAvailableSeats={selectedClass.availableSeats > 0} onCreated={refreshClasses} />
        ) : (
          <div className="border border-carbon bg-light p-6 md:p-10">
            <h3 className="mb-3 font-display text-3xl text-carbon">Escolha uma turma</h3>
            <p className="m-0 leading-relaxed text-muted">Selecione uma turma com vagas para abrir a ficha de inscrição.</p>
          </div>
        )}
      </aside>
    </section>
  )
}
