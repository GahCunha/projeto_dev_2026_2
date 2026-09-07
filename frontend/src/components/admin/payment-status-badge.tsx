import { cva } from 'class-variance-authority'
import type { PaymentStatus } from '../../types/enrollment'

const styles = cva(
  'inline-flex rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider',
  {
    variants: {
      status: {
        ISENTO: 'border-rule bg-light text-muted',
        PENDENTE: 'border-ochre/25 bg-saffron/15 text-ochre',
        PAGO: 'border-success/25 bg-success/10 text-success',
        CANCELADO: 'border-danger/25 bg-danger/10 text-danger',
      },
    },
  },
)

const labels: Record<PaymentStatus, string> = {
  ISENTO: 'Gratuita',
  PENDENTE: 'Aguardando',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={styles({ status })}>{labels[status]}</span>
}
