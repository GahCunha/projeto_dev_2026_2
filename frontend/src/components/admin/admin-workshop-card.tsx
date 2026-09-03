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

export function AdminWorkshopCard({ workshop, onEdit, onStatusChange }: AdminWorkshopCardProps) {
  return (
    <article className="flex flex-col border border-rule bg-paper shadow-craft-sm">
      <div className="relative aspect-[16/7] overflow-hidden border-b border-rule bg-deep craft-fallback">
        {workshop.imageUrl && <img className="size-full object-cover" src={workshop.imageUrl} alt="" />}
        <div className="absolute left-3 top-3"><WorkshopStatusBadge active={workshop.active} /></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-ochre">{workshop.category}</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-tight text-carbon">{workshop.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{workshop.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule/70 pt-4 text-sm">
          <div className="col-span-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Quando</dt>
            <dd className="mt-1 font-bold text-carbon">{dateFormatter.format(new Date(workshop.startsAt))}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Duração</dt>
            <dd className="mt-1 text-carbon">{workshop.durationMin} min</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Vagas</dt>
            <dd className="mt-1 text-carbon">{workshop.capacity}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-muted">Local</dt>
            <dd className="mt-1 text-carbon">{workshop.location}</dd>
          </div>
        </dl>

        <div className="mt-auto flex gap-4 border-t border-rule/70 pt-4">
          <button className="font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" type="button" onClick={() => onEdit(workshop)}>Editar</button>
          <button className={`ml-auto font-mono text-xs font-bold uppercase tracking-wider underline underline-offset-4 ${workshop.active ? 'text-danger' : 'text-success'}`} type="button" onClick={() => onStatusChange(workshop)}>{workshop.active ? 'Desativar' : 'Ativar'}</button>
        </div>
      </div>
    </article>
  )
}
