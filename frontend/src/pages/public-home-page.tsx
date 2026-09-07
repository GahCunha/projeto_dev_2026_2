import { useEffect, useState } from 'react'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { HeroSection } from '../components/sections/hero-section'

import { ProcessSection } from '../components/sections/process-section'
import { TestimonialsSection } from '../components/sections/testimonials-section'
import { WorkshopDetailsSection } from '../components/sections/workshop-details-section'
import { WorkGallerySection } from '../components/sections/work-gallery-section'
import { WorkshopsSection } from '../components/sections/workshops-section'
import { getWorkshops } from '../services/workshop-service'
import type { Workshop } from '../types/workshop'
import type { PaymentStatus } from '../types/enrollment'

export function PublicHomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null,
  )
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null)

  const selectedWorkshop = workshops.find(
    (workshop) => workshop.id === selectedWorkshopId,
  )

  useEffect(() => {
    const controller = new AbortController()

    getWorkshops(controller.signal)
      .then((response) => setWorkshops(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError')
          setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [requestKey])

  useEffect(() => {
    if (!enrollmentNotice) return

    const timeout = window.setTimeout(() => setEnrollmentNotice(null), 7000)
    return () => window.clearTimeout(timeout)
  }, [enrollmentNotice])

  function retry() {
    setError(null)
    setIsLoading(true)
    setRequestKey((currentKey) => currentKey + 1)
  }

  function selectWorkshop(workshopId: string) {
    setSelectedWorkshopId(workshopId)
  }

  function handleEnrollmentCreated(paymentStatus: PaymentStatus) {
    setEnrollmentNotice(
      paymentStatus === 'PENDENTE'
        ? 'Inscrição concluída. Confira seu e-mail para simular o pagamento PIX.'
        : 'Inscrição concluída. A equipe analisará sua participação.',
    )
    setRequestKey((currentKey) => currentKey + 1)
  }

  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <HeroSection workshops={workshops} />
        <WorkshopsSection
          workshops={workshops}
          selectedCategory={selectedCategory}
          isLoading={isLoading}
          error={error}
          onCategoryChange={setSelectedCategory}
          onWorkshopSelect={selectWorkshop}
          onRetry={retry}
        />
        <ProcessSection />
        <TestimonialsSection />
        <WorkGallerySection workshops={workshops} />
      </main>
      <SiteFooter />
      {enrollmentNotice && (
        <div
          className="fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-start justify-between gap-4 border border-success bg-light px-4 py-3 text-sm text-success shadow-craft sm:right-6 sm:bottom-6"
          role="status"
          aria-live="polite"
        >
          <div>
            <strong className="block font-display text-lg text-carbon">
              Sua vaga foi solicitada
            </strong>
            <span>{enrollmentNotice}</span>
          </div>
          <button
            className="grid size-10 shrink-0 place-items-center font-bold text-carbon"
            type="button"
            aria-label="Fechar confirmação"
            onClick={() => setEnrollmentNotice(null)}
          >
            ×
          </button>
        </div>
      )}
      {selectedWorkshop && (
        <WorkshopDetailsSection
          key={selectedWorkshop.id}
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshopId(null)}
          onEnrollmentCreated={handleEnrollmentCreated}
        />
      )}
    </>
  )
}
