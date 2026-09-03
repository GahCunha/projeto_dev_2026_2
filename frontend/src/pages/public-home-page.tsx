import { useEffect, useState } from 'react'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { HeroSection } from '../components/sections/hero-section'
import { ProcessSection } from '../components/sections/process-section'
import { WorkshopDetailsSection } from '../components/sections/workshop-details-section'
import { WorkshopsSection } from '../components/sections/workshops-section'
import { getWorkshops } from '../services/workshop-service'
import type { Workshop } from '../types/workshop'

export function PublicHomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  const selectedWorkshop = workshops.find((workshop) => workshop.id === selectedWorkshopId)

  useEffect(() => {
    const controller = new AbortController()

    getWorkshops(controller.signal)
      .then((response) => setWorkshops(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [requestKey])

  function retry() {
    setError(null)
    setIsLoading(true)
    setRequestKey((currentKey) => currentKey + 1)
  }

  function selectWorkshop(workshopId: string) {
    setSelectedWorkshopId(workshopId)
    window.setTimeout(() => document.querySelector('#detalhes')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <HeroSection workshops={workshops} />
        <WorkshopsSection workshops={workshops} selectedCategory={selectedCategory} isLoading={isLoading} error={error} onCategoryChange={setSelectedCategory} onWorkshopSelect={selectWorkshop} onRetry={retry} />
        {selectedWorkshop && <WorkshopDetailsSection workshop={selectedWorkshop} onClose={() => setSelectedWorkshopId(null)} onEnrollmentCreated={() => setRequestKey((currentKey) => currentKey + 1)} />}
        <ProcessSection />
      </main>
      <SiteFooter />
    </>
  )
}
