import { cva } from 'class-variance-authority'
import type { EnrollmentStatus } from '../../types/enrollment'

const statusStyles = cva(
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider',
  {
    variants: {
      status: {
        PENDENTE: 'border-ochre/25 bg-saffron/15 text-ochre',
        CONFIRMADA: 'border-success/25 bg-success/10 text-success',
        CANCELADA: 'border-danger/25 bg-danger/10 text-danger',
      },
    },
  },
)

const labels: Record<EnrollmentStatus, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
}

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={statusStyles({ status })}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status]}
    </span>
  )
}
