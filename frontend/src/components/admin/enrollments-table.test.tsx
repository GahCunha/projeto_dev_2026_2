import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AdminEnrollment } from '../../types/enrollment'
import { EnrollmentsTable } from './enrollments-table'

function enrollment(status: AdminEnrollment['status']): AdminEnrollment {
  return {
    id: `enrollment-${status}`,
    name: 'Maria Artesã',
    email: 'maria@example.com',
    status,
    workshopId: 'workshop-id',
    classId: 'class-id',
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
    workshop: {
      id: 'workshop-id',
      title: 'Crochê: primeiros pontos',
      startsAt: '2026-10-01T13:00:00.000Z',
      active: true,
    },
  }
}

describe('EnrollmentsTable', () => {
  it('offers confirmation and cancellation for a pending enrollment', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    const pendingEnrollment = enrollment('PENDENTE')
    render(<EnrollmentsTable enrollments={[pendingEnrollment]} onStatusChange={onStatusChange} />)

    const confirmButtons = screen.getAllByRole('button', { name: 'Confirmar' })
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancelar' })
    await user.click(confirmButtons[0]!)
    await user.click(cancelButtons[0]!)

    expect(onStatusChange).toHaveBeenNthCalledWith(1, pendingEnrollment, 'CONFIRMADA')
    expect(onStatusChange).toHaveBeenNthCalledWith(2, pendingEnrollment, 'CANCELADA')
  })

  it('only offers cancellation for a confirmed enrollment', () => {
    render(<EnrollmentsTable enrollments={[enrollment('CONFIRMADA')]} onStatusChange={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).not.toHaveLength(0)
  })

  it('does not offer actions for a canceled enrollment', () => {
    render(<EnrollmentsTable enrollments={[enrollment('CANCELADA')]} onStatusChange={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Nenhuma ação disponível')).not.toHaveLength(0)
  })
})
