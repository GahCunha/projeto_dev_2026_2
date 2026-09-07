import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getEnrollmentPayment,
  simulateEnrollmentPayment,
} from '../services/payment-service'
import { EnrollmentPaymentPage } from './enrollment-payment-page'

vi.mock('../services/payment-service', () => ({
  getEnrollmentPayment: vi.fn(),
  simulateEnrollmentPayment: vi.fn(),
}))

const getPaymentMock = vi.mocked(getEnrollmentPayment)
const simulatePaymentMock = vi.mocked(simulateEnrollmentPayment)
const payment = {
  name: 'Maria Artesã',
  status: 'PENDENTE' as const,
  paymentStatus: 'PENDENTE' as const,
  paidAt: null,
  workshop: { title: 'Cerâmica fria' },
  class: {
    name: 'Turma das quartas',
    price: 75,
    meetings: [
      {
        id: 'meeting',
        startsAt: '2026-10-03T13:00:00.000Z',
        endsAt: '2026-10-03T15:00:00.000Z',
        location: 'Ateliê',
      },
    ],
  },
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/inscricoes/pagamento/token']}>
      <Routes>
        <Route
          path="/inscricoes/pagamento/:token"
          element={<EnrollmentPaymentPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EnrollmentPaymentPage', () => {
  beforeEach(() => {
    getPaymentMock.mockReset()
    simulatePaymentMock.mockReset()
  })

  it('makes the illustrative nature clear and registers payment', async () => {
    getPaymentMock.mockResolvedValue({ data: payment })
    simulatePaymentMock.mockResolvedValue({
      data: {
        ...payment,
        paymentStatus: 'PAGO',
        paidAt: '2026-09-05T15:00:00.000Z',
      },
    })
    const user = userEvent.setup()
    renderPage()

    expect(
      await screen.findByText(/nenhum valor real será cobrado/i),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Simular pagamento PIX' }),
    )

    expect(simulatePaymentMock).toHaveBeenCalledWith('token')
    expect(
      await screen.findByRole('heading', { name: 'Pagamento registrado.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Pago — aguardando confirmação'),
    ).toBeInTheDocument()
  })

  it('does not allow payment after the enrollment is canceled', async () => {
    getPaymentMock.mockResolvedValue({
      data: { ...payment, status: 'CANCELADA', paymentStatus: 'CANCELADO' },
    })
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Inscrição cancelada.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Simular pagamento PIX' }),
    ).not.toBeInTheDocument()
  })
})
