import { useRef, useState } from 'react'
import { pagePadding } from '../../lib/styles'
import { cn } from '../../lib/utils'
import type { Workshop } from '../../types/workshop'
import { WorkshopCard } from '../workshop-card'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/empty-state'
import { Eyebrow } from '../ui/eyebrow'

type WorkshopsSectionProps = {
  workshops: Workshop[]
  selectedCategory: string
  isLoading: boolean
  error: string | null
  onCategoryChange: (category: string) => void
  onWorkshopSelect: (workshopId: string) => void
  onRetry: () => void
}

export function WorkshopsSection({
  workshops,
  selectedCategory,
  isLoading,
  error,
  onCategoryChange,
  onWorkshopSelect,
  onRetry,
}: WorkshopsSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const categories = [
    'Todas',
    ...new Set(workshops.map((workshop) => workshop.category)),
  ]
  const filteredWorkshops =
    selectedCategory === 'Todas'
      ? workshops
      : workshops.filter((workshop) => workshop.category === selectedCategory)
  const visibleWorkshops = showAll
    ? filteredWorkshops
    : filteredWorkshops.slice(0, 6)

  function changeCategory(category: string) {
    setShowAll(false)
    onCategoryChange(category)
  }

  function toggleWorkshops() {
    const isCollapsing = showAll
    setShowAll((current) => !current)

    if (isCollapsing) {
      window.requestAnimationFrame(() => {
        toggleButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
  }

  return (
    <section
      className={`scroll-mt-18 bg-light py-12 lg:py-20 ${pagePadding}`}
      id="oficinas"
      aria-labelledby="workshops-title"
    >
      <div className="mb-10 flex items-end justify-between gap-8 border-b border-rule pb-5 max-sm:flex-col max-sm:items-stretch">
        <div>
          <Eyebrow className="mb-1.5">Vagas limitadas</Eyebrow>
          <h2
            className="m-0 font-display text-4xl -tracking-wide text-balance text-carbon md:text-5xl"
            id="workshops-title"
          >
            Próximas oficinas
          </h2>
        </div>

        {workshops.length > 0 && (
          <div
            className="flex flex-wrap justify-end gap-1.5 max-sm:flex-nowrap max-sm:justify-start max-sm:overflow-x-auto max-sm:pb-1.5"
            aria-label="Filtrar por categoria"
          >
            {categories.map((category) => (
              <button
                className={cn(
                  'min-h-10 shrink-0 cursor-pointer rounded-sm border px-3 py-2 font-mono text-xs tracking-widest uppercase',
                  selectedCategory === category
                    ? 'border-carbon bg-carbon text-light'
                    : 'border-rule bg-transparent text-muted hover:border-carbon hover:bg-deep hover:text-ink',
                )}
                type="button"
                key={category}
                aria-pressed={selectedCategory === category}
                onClick={() => changeCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && <WorkshopSkeleton />}

      {!isLoading && error && (
        <EmptyState
          role="alert"
          mark="×"
          title="As portas do ateliê não abriram."
          description={error}
          action={
            <Button variant="outline" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      )}

      {!isLoading && !error && workshops.length === 0 && (
        <EmptyState
          mark="○"
          title="A bancada está sendo preparada."
          description="Ainda não há novas oficinas. Volte em breve para descobrir a próxima turma."
        />
      )}

      {!isLoading &&
        !error &&
        workshops.length > 0 &&
        (filteredWorkshops.length > 0 ? (
          <div
            className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 lg:gap-9"
            id="workshops-grid"
          >
            {visibleWorkshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onSelect={onWorkshopSelect}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma oficina nesta categoria."
            action={
              <Button variant="ghost" onClick={() => onCategoryChange('Todas')}>
                Ver todas as oficinas
              </Button>
            }
          />
        ))}

      {!isLoading && !error && filteredWorkshops.length > 6 && (
        <div className="mt-12 flex justify-center border-t border-dashed border-rule pt-7">
          <Button
            ref={toggleButtonRef}
            variant="outline"
            aria-expanded={showAll}
            aria-controls="workshops-grid"
            onClick={toggleWorkshops}
          >
            {showAll ? 'Mostrar menos ↑' : 'Ver todas as oficinas →'}
          </Button>
        </div>
      )}
    </section>
  )
}

function WorkshopSkeleton() {
  return (
    <div
      className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 lg:gap-9"
      aria-label="Carregando oficinas"
    >
      {[0, 1, 2].map((item) => (
        <span
          className="h-108 animate-loading border border-rule loading-surface"
          key={item}
        />
      ))}
    </div>
  )
}
