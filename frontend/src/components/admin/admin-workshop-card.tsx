import { Link } from 'react-router-dom'
import { responsiveImageProps } from '../../lib/responsive-image'
import { cn } from '../../lib/utils'
import type { AdminWorkshop } from '../../types/workshop'
import { buttonVariants } from '../ui/button-variants'
import { WorkshopStatusBadge } from './workshop-status-badge'

type AdminWorkshopCardProps = {
  workshop: AdminWorkshop
  onEdit: (workshop: AdminWorkshop) => void
  onStatusChange: (workshop: AdminWorkshop) => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function AdminWorkshopCard({
  workshop,
  onEdit,
  onStatusChange,
}: AdminWorkshopCardProps) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden border border-rule bg-paper shadow-craft-sm">
      <div className="aspect-16/7 overflow-hidden bg-deep craft-fallback">
        {workshop.imageUrl && (
          <img
            className="size-full object-cover"
            {...responsiveImageProps(
              workshop.imageUrl,
              '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw',
              [480, 720, 960],
            )}
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-y border-rule bg-deep px-5 py-2.5">
        <p className="truncate font-mono text-xs tracking-wider text-ochre uppercase">
          {workshop.category}
        </p>
        <div className="shrink-0">
          <WorkshopStatusBadge active={workshop.active} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl leading-tight font-bold text-carbon">
          {workshop.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {workshop.description}
        </p>

        <dl className="mt-5 grid grid-cols-3 border-y border-rule/70 py-4 text-sm">
          <div className="pr-3">
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Turmas
            </dt>
            <dd className="mt-1 font-bold text-carbon">
              {workshop.classCount}
            </dd>
          </div>
          <div className="border-l border-rule/70 px-3">
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Ocupação
            </dt>
            <dd className="mt-1 font-bold text-carbon tabular-nums">
              {workshop.occupiedSeats} de {workshop.totalCapacity}
            </dd>
          </div>
          <div className="border-l border-rule/70 pl-3">
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Disponíveis
            </dt>
            <dd
              className={`mt-1 font-bold tabular-nums ${workshop.availableSeats === 0 ? 'text-danger' : 'text-success'}`}
            >
              {workshop.availableSeats}
            </dd>
          </div>
          <div className="col-span-3 mt-4 border-t border-dashed border-rule/70 pt-4">
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Próximo encontro
            </dt>
            <dd className="mt-1 text-carbon">
              {workshop.nextMeetingAt
                ? dateFormatter.format(new Date(workshop.nextMeetingAt))
                : 'Nenhum encontro futuro'}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-muted">
          <strong className="text-carbon tabular-nums">
            {workshop.enrollmentCount}
          </strong>{' '}
          {workshop.enrollmentCount === 1
            ? 'inscrição no total'
            : 'inscrições no total'}
          , incluindo canceladas.
        </p>

        <div className="mt-auto pt-5">
          <div className="grid grid-cols-2 gap-2">
            <Link
              className={buttonVariants({ variant: 'outline', size: 'full' })}
              to={`/admin/oficinas/${workshop.id}/turmas?${new URLSearchParams({ workshopTitle: workshop.title })}`}
            >
              Gerir turmas
            </Link>
            <Link
              className={buttonVariants({ variant: 'outline', size: 'full' })}
              to={`/admin/inscricoes?${new URLSearchParams({ workshopId: workshop.id, workshopTitle: workshop.title })}`}
            >
              Inscrições
            </Link>
            <button
              className={buttonVariants({ variant: 'outline', size: 'full' })}
              type="button"
              onClick={() => onEdit(workshop)}
            >
              Editar oficina
            </button>
            <button
              className={cn(
                buttonVariants({ variant: 'outline', size: 'full' }),
                workshop.active
                  ? 'border-danger text-danger hover:shadow-none'
                  : 'border-success text-success hover:shadow-none',
              )}
              type="button"
              onClick={() => onStatusChange(workshop)}
            >
              {workshop.active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
