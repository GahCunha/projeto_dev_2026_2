import type { AdminEnrollment } from '../../types/enrollment'
import { EnrollmentStatusBadge } from './enrollment-status-badge'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function EnrollmentsTable({ enrollments }: { enrollments: AdminEnrollment[] }) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {enrollments.map((enrollment) => (
          <article className="border border-rule bg-paper p-4 shadow-craft-sm" key={enrollment.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm text-carbon">{enrollment.name}</strong>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/70">
            {enrollments.map((enrollment) => (
              <tr className="transition hover:bg-light" key={enrollment.id}>
                <td className="px-5 py-4 align-top">
                  <strong className="block text-sm text-carbon">{enrollment.name}</strong>
                  <span className="mt-1 block text-sm text-muted">{enrollment.email}</span>
                </td>
                <td className="px-5 py-4 align-top">
                  <span className="block max-w-xs text-sm font-bold text-carbon">{enrollment.workshop.title}</span>
                  {!enrollment.workshop.active && <small className="mt-1 block text-danger">Oficina inativa</small>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-muted">
                  {dateFormatter.format(new Date(enrollment.workshop.startsAt))}
                </td>
                <td className="px-5 py-4 align-top"><EnrollmentStatusBadge status={enrollment.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  )
}
