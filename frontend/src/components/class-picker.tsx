import { cn } from '../lib/utils'
import type { WorkshopClass } from '../types/workshop-class'

type ClassPickerProps = {
  classes: WorkshopClass[]
  selectedClassId: string | null
  onSelect: (classId: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatMeetingSchedule(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const isSameDay = start.toDateString() === end.toDateString()

  if (!isSameDay) {
    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} até ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`
  }

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ClassPicker({
  classes,
  selectedClassId,
  onSelect,
}: ClassPickerProps) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-4 font-display text-2xl text-carbon">
        Escolha sua turma
      </legend>
      <div className="grid gap-4">
        {classes.map((workshopClass) => {
          const selected = workshopClass.id === selectedClassId
          const soldOut = workshopClass.availableSeats === 0

          return (
            <label
              className={cn(
                'relative grid cursor-pointer gap-4 border-2 bg-light p-5 transition-[transform,box-shadow,border-color,background-color] duration-200 focus-within:outline-none sm:grid-cols-[1fr_auto]',
                selected
                  ? '-translate-y-0.5 border-carbon bg-paper/30 shadow-button'
                  : 'border-rule hover:border-carbon/70 hover:bg-paper/20',
                soldOut && 'cursor-not-allowed opacity-60',
              )}
              key={workshopClass.id}
            >
              <input
                className="sr-only"
                type="radio"
                name="workshop-class"
                value={workshopClass.id}
                checked={selected}
                disabled={soldOut}
                onChange={() => onSelect(workshopClass.id)}
              />

              <span className="grid gap-2 pr-8">
                <strong className="font-display text-xl text-carbon">
                  {workshopClass.name}
                </strong>
                <span className="grid gap-1 text-sm text-muted">
                  {workshopClass.meetings.map((meeting, index) => (
                    <span key={meeting.id}>
                      <span className="font-mono text-xs tracking-wider text-ochre uppercase">
                        Aula {index + 1}
                      </span>{' '}
                      {formatMeetingSchedule(meeting.startsAt, meeting.endsAt)}{' '}
                      · {meeting.location}
                    </span>
                  ))}
                </span>
              </span>

              <span className="flex items-end justify-between gap-4 border-t border-dashed border-rule pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                <span
                  className={cn(
                    'font-mono text-xs tracking-wider uppercase',
                    selected ? 'text-green' : 'text-muted',
                  )}
                  aria-hidden="true"
                >
                  {selected ? '✓ Selecionada' : '○ Selecionar'}
                </span>
                <strong className="font-mono text-sm text-carbon tabular-nums">
                  {workshopClass.price === 0
                    ? 'Gratuita'
                    : priceFormatter.format(workshopClass.price)}
                </strong>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    soldOut ? 'text-danger' : 'text-ochre',
                  )}
                >
                  {soldOut
                    ? 'Turma completa'
                    : `${workshopClass.availableSeats} vagas`}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
