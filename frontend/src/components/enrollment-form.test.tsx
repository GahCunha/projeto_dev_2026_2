import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEnrollment } from '../services/enrollment-service'
import { EnrollmentForm } from './enrollment-form'

vi.mock('../services/enrollment-service', () => ({ createEnrollment: vi.fn() }))

const createEnrollmentMock = vi.mocked(createEnrollment)

describe('EnrollmentForm', () => {
  beforeEach(() => createEnrollmentMock.mockReset())

  it('validates the participant name before calling the API', async () => {
    const user = userEvent.setup()
    render(
      <EnrollmentForm
        classId="class-id"
        hasAvailableSeats
        onCreated={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Nome completo'), 'Al')
    await user.type(screen.getByLabelText('E-mail'), 'al@example.com')
    await user.click(screen.getByRole('button', { name: 'Quero participar' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'pelo menos 3 caracteres',
    )
    expect(createEnrollmentMock).not.toHaveBeenCalled()
  })

  it('submits normalized data and shows the success message', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    createEnrollmentMock.mockResolvedValue({
      data: {
        id: 'enrollment-id',
        name: 'Maria Artesã',
        email: 'maria@example.com',
        classId: 'class-id',
        status: 'PENDENTE',
        paymentStatus: 'PENDENTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    render(
      <EnrollmentForm
        classId="class-id"
        hasAvailableSeats
        onCreated={onCreated}
      />,
    )

    await user.type(screen.getByLabelText('Nome completo'), '  Maria Artesã  ')
    await user.type(screen.getByLabelText('E-mail'), '  maria@example.com  ')
    await user.click(screen.getByRole('button', { name: 'Quero participar' }))

    expect(createEnrollmentMock).toHaveBeenCalledWith({
      name: 'Maria Artesã',
      email: 'maria@example.com',
      classId: 'class-id',
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Inscrição recebida',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'link para simular o pagamento PIX',
    )
    expect(onCreated).toHaveBeenCalledOnce()
  })

  it('does not render a form when there are no seats', () => {
    render(
      <EnrollmentForm
        classId="class-id"
        hasAvailableSeats={false}
        onCreated={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'sem vagas disponíveis',
    )
    expect(
      screen.queryByRole('button', { name: 'Quero participar' }),
    ).not.toBeInTheDocument()
  })
})
