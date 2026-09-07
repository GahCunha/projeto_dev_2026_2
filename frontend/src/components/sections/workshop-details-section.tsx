import { useEffect, useRef, useState } from 'react'
import { getWorkshopClasses } from '../../services/class-service'
import { responsiveImageProps } from '../../lib/responsive-image'
import type { WorkshopClass } from '../../types/workshop-class'
import type { Workshop } from '../../types/workshop'
import type { PaymentStatus } from '../../types/enrollment'
import { ClassPicker } from '../class-picker'
import { EnrollmentForm } from '../enrollment-form'
import { Button } from '../ui/button'
import { ImageFallback } from '../ui/image-fallback'

type WorkshopDetailsSectionProps = {
  workshop: Workshop
  onClose: () => void
  onEnrollmentCreated: (paymentStatus: PaymentStatus) => void
}

export function WorkshopDetailsSection({
  workshop,
  onClose,
  onEnrollmentCreated,
}: WorkshopDetailsSectionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [classes, setClasses] = useState<WorkshopClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const selectedClass =
    classes.find((item) => item.id === selectedClassId) ?? null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()
  }, [])

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
        if (
          requestError instanceof Error &&
          requestError.name !== 'AbortError'
        ) {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [workshop.id, requestKey])

  function finishEnrollment(paymentStatus: PaymentStatus) {
    onEnrollmentCreated(paymentStatus)
    closeDialog()
  }

  function retryClasses() {
    setIsLoading(true)
    setError(null)
    setRequestKey((current) => current + 1)
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog()
  }

  return (
    <dialog
      ref={dialogRef}
      className="mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-hidden border border-b-0 border-rule bg-paper p-0 text-ink shadow-craft backdrop:bg-carbon/70 sm:m-auto sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)] sm:max-w-6xl sm:border-b"
      aria-labelledby="selected-workshop-title"
      onCancel={(event) => {
        event.preventDefault()
        closeDialog()
      }}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-rule bg-light px-4 py-3 sm:px-6">
        <p className="m-0 truncate font-mono text-xs tracking-widest text-muted uppercase">
          Detalhes da oficina
        </p>
        <Button
          variant="ghost"
          aria-label="Fechar detalhes da oficina"
          onClick={closeDialog}
        >
          Fechar <span aria-hidden="true">×</span>
        </Button>
      </div>

      <section className="grid max-h-[calc(92dvh-3.75rem)] grid-cols-1 gap-7 overflow-y-auto overscroll-contain px-4 py-5 sm:max-h-[calc(100dvh-6.75rem)] sm:px-6 sm:py-7 lg:grid-cols-5 lg:gap-10 lg:px-9 lg:py-8">
        <div className="lg:col-span-3">
          <div className="relative mb-6 h-48 border border-carbon bg-light p-2 shadow-offset sm:h-64 lg:h-72">
            {workshop.imageUrl ? (
              <img
                className="block h-full w-full object-cover"
                {...responsiveImageProps(
                  workshop.imageUrl,
                  '(max-width: 1024px) 100vw, 60vw',
                  [640, 960, 1280],
                )}
                alt={`Oficina ${workshop.title}`}
                width="960"
                height="640"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <ImageFallback />
            )}
            <span
              className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="justify-self-start bg-green px-2.5 py-1.5 font-mono text-xs tracking-widest text-white uppercase">
              {workshop.category}
            </span>
            <h2
              className="my-3 mb-4 w-full font-display text-3xl leading-none -tracking-wider text-balance text-carbon sm:text-4xl md:text-5xl"
              id="selected-workshop-title"
            >
              {workshop.title}
            </h2>
          </div>

          <p className="my-5 text-base leading-relaxed text-pretty text-muted sm:text-lg">
            {workshop.description}
          </p>

          <div className="my-6 border-y border-rule py-5 sm:my-8 sm:py-6">
            {isLoading && (
              <div
                className="h-40 animate-loading border border-rule loading-surface"
                aria-label="Carregando turmas"
              />
            )}
            {!isLoading && error && (
              <div
                className="grid gap-3 border-l-4 border-danger bg-deep p-4"
                role="alert"
              >
                <p className="m-0">{error}</p>
                <Button
                  className="justify-self-start"
                  variant="ghost"
                  onClick={retryClasses}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
            {!isLoading && !error && classes.length === 0 && (
              <p className="m-0 text-muted">
                Esta oficina ainda não possui turmas disponíveis.
              </p>
            )}
            {!isLoading && !error && classes.length > 0 && (
              <ClassPicker
                classes={classes}
                selectedClassId={selectedClassId}
                onSelect={setSelectedClassId}
              />
            )}
          </div>

          <div className="relative mt-8 border border-rule bg-deep px-5 pt-8 pb-5 sm:mt-10 sm:px-6">
            <span className="absolute -top-3 left-5 bg-paper px-2 py-1 font-mono text-xs tracking-widest text-ochre uppercase">
              Lista de materiais
            </span>
            {workshop.materials.length > 0 ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {workshop.materials.map((material) => (
                  <li className="flex gap-3" key={material}>
                    <span
                      className="grid size-5 shrink-0 place-items-center border border-green text-xs text-green"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {material}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum material precisa ser levado.</p>
            )}
          </div>
        </div>

        <aside className="relative self-start shadow-craft lg:sticky lg:top-0 lg:col-span-2">
          {selectedClass ? (
            <EnrollmentForm
              key={selectedClass.id}
              classId={selectedClass.id}
              hasAvailableSeats={selectedClass.availableSeats > 0}
              onCreated={finishEnrollment}
            />
          ) : (
            <div className="border border-carbon bg-light p-6 md:p-10">
              <h3 className="mb-3 font-display text-3xl text-carbon">
                Escolha uma turma
              </h3>
              <p className="m-0 leading-relaxed text-muted">
                Selecione uma turma com vagas para abrir a ficha de inscrição.
              </p>
            </div>
          )}
        </aside>
      </section>
    </dialog>
  )
}
