import { useState } from 'react'
import { cn } from '../lib/utils'
import { responsiveImageProps } from '../lib/responsive-image'
import type { Workshop } from '../types/workshop'
import { Button } from './ui/button'
import { ImageFallback } from './ui/image-fallback'

type WorkshopCardProps = {
  workshop: Workshop
  onSelect: (workshopId: string) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
})

function formatPrice(minimumPrice: number | null, maximumPrice: number | null) {
  if (minimumPrice === null || maximumPrice === null)
    return 'Consulte as turmas'
  if (maximumPrice === 0) return 'Grátis'
  if (minimumPrice === 0) return 'Grátis ou paga'
  if (minimumPrice === maximumPrice) return priceFormatter.format(minimumPrice)
  return `A partir de ${priceFormatter.format(minimumPrice)}`
}

export function WorkshopCard({ workshop, onSelect }: WorkshopCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const isSoldOut = workshop.availableSeats === 0

  return (
    <article className="group min-w-0 border border-rule bg-light shadow-craft-sm transition duration-200 even:translate-y-3 hover:-translate-y-1 hover:shadow-craft even:hover:translate-y-2 max-sm:even:translate-y-0 max-sm:even:hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden border-b border-rule bg-deep">
        {workshop.imageUrl && !imageFailed ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            {...responsiveImageProps(
              workshop.imageUrl,
              '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw',
              [480, 640, 800],
            )}
            alt={`Materiais da oficina ${workshop.title}`}
            width="640"
            height="420"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageFallback />
        )}
        <span className="absolute top-3 left-3 bg-green px-2.5 py-1.5 font-mono text-xs tracking-widest text-white uppercase">
          {workshop.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-5 min-h-12 font-display text-2xl leading-tight text-carbon">
          {workshop.title}
        </h3>
        <dl className="m-0 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <dt className="mb-1 font-mono text-xs tracking-widest text-muted uppercase">
              Quando
            </dt>
            <dd className="m-0">
              {workshop.nextMeetingAt
                ? formatDate(workshop.nextMeetingAt)
                : 'Consulte as turmas'}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-mono text-xs tracking-widest text-muted uppercase">
              Turmas
            </dt>
            <dd className="m-0">{workshop.classCount}</dd>
          </div>
          <div>
            <dt className="mb-1 font-mono text-xs tracking-widest text-muted uppercase">
              Valor
            </dt>
            <dd className="m-0 font-bold text-carbon tabular-nums">
              {formatPrice(workshop.minimumPrice, workshop.maximumPrice)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-dashed border-rule pt-4">
          <span
            className={cn(
              'font-mono text-xs before:mr-2 before:inline-block before:size-1.5 before:rounded-full before:bg-current',
              isSoldOut ? 'text-danger' : 'text-ochre',
            )}
          >
            {isSoldOut
              ? 'Turma completa'
              : `${workshop.availableSeats} ${workshop.availableSeats === 1 ? 'lugar' : 'lugares'}`}
          </span>
          <Button
            className="gap-2 text-right"
            variant="ghost"
            onClick={() => onSelect(workshop.id)}
          >
            {isSoldOut ? 'Ver detalhes' : 'Quero conhecer'}{' '}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
