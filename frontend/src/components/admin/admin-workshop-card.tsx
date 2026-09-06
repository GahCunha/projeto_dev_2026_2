import { Link } from 'react-router-dom'
import type { AdminWorkshop } from '../../types/workshop'
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
    <article className="flex flex-col border border-rule bg-paper shadow-craft-sm">
      <div className="relative aspect-[16/7] overflow-hidden border-b border-rule bg-deep craft-fallback">
        {workshop.imageUrl && (
          <img
            className="size-full object-cover"
            src={workshop.imageUrl}
            alt=""
          />
        )}
        <div className="absolute top-3 left-3">
          <WorkshopStatusBadge active={workshop.active} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs tracking-wider text-ochre uppercase">
          {workshop.category}
        </p>
        <h2 className="mt-2 font-display text-xl leading-tight font-bold text-carbon">
          {workshop.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {workshop.description}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule/70 pt-4 text-sm">
          <div>
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Turmas
            </dt>
            <dd className="mt-1 font-bold text-carbon">
              {workshop.classCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Ocupação
            </dt>
            <dd className="mt-1 font-bold text-carbon tabular-nums">
              {workshop.occupiedSeats} de {workshop.totalCapacity}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs tracking-wider text-muted uppercase">
              Disponíveis
            </dt>
            <dd
              className={`mt-1 font-bold tabular-nums ${workshop.availableSeats === 0 ? 'text-danger' : 'text-success'}`}
            >
              {workshop.availableSeats}
            </dd>
          </div>
          <div className="col-span-2">
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

        <p className="mt-4 text-xs text-muted">
          <strong className="text-carbon tabular-nums">
            {workshop.enrollmentCount}
          </strong>{' '}
          {workshop.enrollmentCount === 1
            ? 'inscrição no total'
            : 'inscrições no total'}
          , incluindo canceladas.
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule/70 pt-4">
          <Link
            className="font-mono text-xs font-bold tracking-wider text-blue uppercase underline decoration-saffron decoration-2 underline-offset-4"
            to={`/admin/oficinas/${workshop.id}/turmas?${new URLSearchParams({ workshopTitle: workshop.title })}`}
          >
            Gerir turmas
          </Link>
          <Link
            className="font-mono text-xs font-bold tracking-wider text-blue uppercase underline decoration-saffron decoration-2 underline-offset-4"
            to={`/admin/inscricoes?${new URLSearchParams({ workshopId: workshop.id, workshopTitle: workshop.title })}`}
          >
            Gerir inscrições
          </Link>
          <button
            className="font-mono text-xs font-bold tracking-wider text-blue uppercase underline decoration-saffron decoration-2 underline-offset-4"
            type="button"
            onClick={() => onEdit(workshop)}
          >
            Editar
          </button>
          <button
            className={`ml-auto font-mono text-xs font-bold tracking-wider uppercase underline underline-offset-4 ${workshop.active ? 'text-danger' : 'text-success'}`}
            type="button"
            onClick={() => onStatusChange(workshop)}
          >
            {workshop.active ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>
    </article>
  )
}
