import { Link } from 'react-router-dom'
import type { WorkshopClass } from '../../types/workshop-class'
import { WorkshopStatusBadge } from './workshop-status-badge'

type AdminClassCardProps = {
  workshopClass: WorkshopClass
  workshopTitle: string
  onEdit: (workshopClass: WorkshopClass) => void
  onStatusChange: (workshopClass: WorkshopClass) => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function AdminClassCard({ workshopClass, workshopTitle, onEdit, onStatusChange }: AdminClassCardProps) {
  return (
    <article className="flex flex-col border border-rule bg-paper shadow-craft-sm">
      <header className="flex items-start justify-between gap-4 border-b border-rule/70 p-5">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-ochre">
            {workshopClass.meetings.length} {workshopClass.meetings.length === 1 ? 'aula' : 'aulas'}
          </p>
          <h2 className="font-display text-xl font-bold leading-tight text-carbon">{workshopClass.name}</h2>
        </div>
        <WorkshopStatusBadge active={workshopClass.active} />
      </header>

      <div className="flex flex-1 flex-col p-5">
        <ol className="m-0 grid list-none gap-3 p-0">
          {workshopClass.meetings.map((meeting, index) => (
            <li className="grid grid-cols-[2rem_1fr] gap-3 text-sm" key={meeting.id}>
              <span className="grid size-8 place-items-center border border-green font-mono text-xs text-green">{index + 1}</span>
              <span>
                <strong className="block text-carbon">{dateFormatter.format(new Date(meeting.startsAt))}</strong>
                <span className="text-muted">{meeting.location}</span>
              </span>
            </li>
          ))}
        </ol>

        <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-rule/70 py-4 text-sm">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Preço</dt>
            <dd className="mt-1 font-bold tabular-nums text-carbon">{workshopClass.price === 0 ? 'Gratuita' : priceFormatter.format(workshopClass.price)}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Ocupação</dt>
            <dd className="mt-1 font-bold tabular-nums text-carbon">{workshopClass.occupiedSeats}/{workshopClass.capacity}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Livres</dt>
            <dd className={`mt-1 font-bold tabular-nums ${workshopClass.availableSeats === 0 ? 'text-danger' : 'text-success'}`}>{workshopClass.availableSeats}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-5">
          <Link
            className="font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4"
            to={`/admin/inscricoes?${new URLSearchParams({ classId: workshopClass.id, workshopId: workshopClass.workshopId, workshopTitle, className: workshopClass.name })}`}
          >
            Gerir inscrições
          </Link>
          <button className="font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" type="button" onClick={() => onEdit(workshopClass)}>Editar</button>
          <button className={`ml-auto font-mono text-xs font-bold uppercase tracking-wider underline underline-offset-4 ${workshopClass.active ? 'text-danger' : 'text-success'}`} type="button" onClick={() => onStatusChange(workshopClass)}>{workshopClass.active ? 'Desativar' : 'Ativar'}</button>
        </div>
      </div>
    </article>
  )
}
