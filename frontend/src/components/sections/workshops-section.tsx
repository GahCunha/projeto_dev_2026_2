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

export function WorkshopsSection({ workshops, selectedCategory, isLoading, error, onCategoryChange, onWorkshopSelect, onRetry }: WorkshopsSectionProps) {
  const categories = ['Todas', ...new Set(workshops.map((workshop) => workshop.category))]
  const filteredWorkshops = selectedCategory === 'Todas'
    ? workshops
    : workshops.filter((workshop) => workshop.category === selectedCategory)

  return (
    <section className={`scroll-mt-18 bg-light py-12 lg:py-20 ${pagePadding}`} id="oficinas" aria-labelledby="workshops-title">
      <div className="mb-10 flex items-end justify-between gap-8 border-b border-rule pb-5 max-sm:flex-col max-sm:items-stretch">
        <div>
          <Eyebrow className="mb-1.5">Vagas limitadas</Eyebrow>
          <h2 className="m-0 text-balance font-display text-4xl -tracking-wide text-carbon md:text-5xl" id="workshops-title">Próximas oficinas</h2>
        </div>

        {workshops.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5 max-sm:flex-nowrap max-sm:justify-start max-sm:overflow-x-auto max-sm:pb-1.5" aria-label="Filtrar por categoria">
            {categories.map((category) => (
              <button
                className={cn(
                  'min-h-10 shrink-0 cursor-pointer rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-widest',
                  selectedCategory === category
                    ? 'border-carbon bg-carbon text-light'
                    : 'border-rule bg-transparent text-muted hover:border-carbon hover:bg-carbon hover:text-light',
                )}
                type="button"
                key={category}
                aria-pressed={selectedCategory === category}
                onClick={() => onCategoryChange(category)}
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
          action={<Button variant="outline" onClick={onRetry}>Tentar novamente</Button>}
        />
      )}

      {!isLoading && !error && workshops.length === 0 && (
        <EmptyState mark="○" title="A bancada está sendo preparada." description="Ainda não há novas oficinas. Volte em breve para descobrir a próxima turma." />
      )}

      {!isLoading && !error && workshops.length > 0 && (
        filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-3 gap-5 lg:gap-9 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {filteredWorkshops.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} onSelect={onWorkshopSelect} />)}
          </div>
        ) : (
          <EmptyState title="Nenhuma oficina nesta categoria." action={<Button variant="ghost" onClick={() => onCategoryChange('Todas')}>Ver todas as oficinas</Button>} />
        )
      )}
    </section>
  )
}

function WorkshopSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-5 lg:gap-9 max-lg:grid-cols-2 max-sm:grid-cols-1" aria-label="Carregando oficinas">
      {[0, 1, 2].map((item) => <span className="loading-surface animate-loading h-108 border border-rule" key={item} />)}
    </div>
  )
}
