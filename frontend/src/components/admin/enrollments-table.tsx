import type { AdminEnrollment, EnrollmentStatus } from '../../types/enrollment'
import { EnrollmentStatusBadge } from './enrollment-status-badge'

type NextEnrollmentStatus = Extract<EnrollmentStatus, 'CONFIRMADA' | 'CANCELADA'>

type EnrollmentsTableProps = {
  enrollments: AdminEnrollment[]
  updatingEnrollmentId?: string
  onStatusChange: (enrollment: AdminEnrollment, status: NextEnrollmentStatus) => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function EnrollmentsTable({ enrollments, updatingEnrollmentId, onStatusChange }: EnrollmentsTableProps) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {enrollments.map((enrollment) => (
          <article className="border border-rule bg-paper p-4 shadow-craft-sm" key={enrollment.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm text-carbon">{enrollment.name}</strong>
                <span className="sr-only"> — </span>
                <span className="mt-1 block truncate text-sm text-muted">{enrollment.email}</span>
              </div>
              <EnrollmentStatusBadge status={enrollment.status} />
            </div>
            <dl className="grid gap-3 border-t border-rule/70 pt-3">
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-muted">Oficina</dt>
                <dd className="mt-1 text-sm font-bold text-carbon">{enrollment.workshop.title}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-muted">Data</dt>
                <dd className="mt-1 text-sm text-muted">{dateFormatter.format(new Date(enrollment.workshop.startsAt))}</dd>
              </div>
            </dl>
            <EnrollmentActions enrollment={enrollment} disabled={updatingEnrollmentId === enrollment.id} onStatusChange={onStatusChange} className="mt-4 border-t border-rule/70 pt-3" />
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden border border-rule bg-paper shadow-craft-sm sm:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl border-collapse text-left">
          <thead className="border-b border-rule bg-deep/55">
            <tr className="font-mono text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-normal">Participante</th>
              <th className="px-5 py-3 font-normal">Oficina</th>
              <th className="px-5 py-3 font-normal">Data</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 text-right font-normal">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/70">
            {enrollments.map((enrollment) => (
              <tr className="transition hover:bg-light" key={enrollment.id}>
                <td className="px-5 py-4 align-middle">
                  <strong className="block text-sm text-carbon">{enrollment.name}</strong>
                  <span className="sr-only"> — </span>
                  <span className="mt-1 block text-sm text-muted">{enrollment.email}</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="block max-w-xs text-sm font-bold text-carbon">{enrollment.workshop.title}</span>
                  {!enrollment.workshop.active && <small className="mt-1 block text-danger">Oficina inativa</small>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-middle text-sm text-muted">
                  {dateFormatter.format(new Date(enrollment.workshop.startsAt))}
                </td>
                <td className="px-5 py-4 align-middle"><EnrollmentStatusBadge status={enrollment.status} /></td>
                <td className="px-5 py-4 align-middle">
                  <EnrollmentActions enrollment={enrollment} disabled={updatingEnrollmentId === enrollment.id} onStatusChange={onStatusChange} className="justify-end" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  )
}

function EnrollmentActions({ enrollment, disabled, onStatusChange, className }: {
  enrollment: AdminEnrollment
  disabled: boolean
  onStatusChange: EnrollmentsTableProps['onStatusChange']
  className?: string
}) {
  if (enrollment.status === 'CANCELADA') {
    return <p className={`text-right text-xs text-muted ${className ?? ''}`}>Nenhuma ação disponível</p>
  }

  const actionStyles = 'min-h-10 font-mono text-xs font-bold uppercase tracking-wider underline underline-offset-4 disabled:cursor-wait disabled:opacity-50'

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className ?? ''}`}>
      {enrollment.status === 'PENDENTE' && (
        <>
          <button className={`${actionStyles} text-success`} type="button" disabled={disabled} onClick={() => onStatusChange(enrollment, 'CONFIRMADA')}>Confirmar</button>
          <span className="sr-only"> ou </span>
        </>
      )}
      <button className={`${actionStyles} text-danger`} type="button" disabled={disabled} onClick={() => onStatusChange(enrollment, 'CANCELADA')}>Cancelar</button>
    </div>
  )
}
