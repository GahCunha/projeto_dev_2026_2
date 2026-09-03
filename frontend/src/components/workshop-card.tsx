import { useState } from 'react'
import { cn } from '../lib/utils'
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

export function WorkshopCard({ workshop, onSelect }: WorkshopCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const isSoldOut = workshop.availableSeats === 0

  return (
    <article className="group min-w-0 border border-rule bg-light shadow-craft-sm transition duration-200 hover:-translate-y-1 hover:shadow-craft even:translate-y-3 even:hover:translate-y-2 max-sm:even:translate-y-0 max-sm:even:hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden border-b border-rule bg-deep">
        {workshop.imageUrl && !imageFailed ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={workshop.imageUrl}
            alt={`Materiais da oficina ${workshop.title}`}
            width="640"
            height="420"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageFallback />
        )}
        <span className="absolute top-3 left-3 bg-green px-2.5 py-1.5 font-mono text-xs uppercase tracking-widest text-white">{workshop.category}</span>
      </div>

      <div className="p-5">
        <h3 className="mb-5 min-h-12 font-display text-2xl leading-tight text-carbon">{workshop.title}</h3>
        <dl className="m-0 grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <dt className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">Quando</dt>
            <dd className="m-0">{formatDate(workshop.startsAt)}</dd>
          </div>
          <div>
            <dt className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">Duração</dt>
            <dd className="m-0">{Math.round(workshop.durationMin / 60)}h</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-dashed border-rule pt-4">
          <span className={cn('font-mono text-xs before:mr-2 before:inline-block before:size-1.5 before:rounded-full before:bg-current', isSoldOut ? 'text-danger' : 'text-ochre')}>
            {isSoldOut ? 'Turma completa' : `${workshop.availableSeats} ${workshop.availableSeats === 1 ? 'lugar' : 'lugares'}`}
          </span>
          <Button className="gap-2 text-right" variant="ghost" onClick={() => onSelect(workshop.id)}>
            {isSoldOut ? 'Ver detalhes' : 'Quero conhecer'} <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
