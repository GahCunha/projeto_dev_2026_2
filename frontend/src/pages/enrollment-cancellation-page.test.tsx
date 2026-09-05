import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cancelEnrollment, getEnrollmentCancellation } from '../services/cancellation-service'
import { EnrollmentCancellationPage } from './enrollment-cancellation-page'

vi.mock('../services/cancellation-service', () => ({
  getEnrollmentCancellation: vi.fn(),
  cancelEnrollment: vi.fn(),
}))

const getCancellationMock = vi.mocked(getEnrollmentCancellation)
const cancelEnrollmentMock = vi.mocked(cancelEnrollment)
const token = 'a'.repeat(64)
const enrollment = {
  id: 'enrollment-id',
  name: 'Maria Artesã',
  status: 'PENDENTE' as const,
  workshop: {
    title: 'Cerâmica fria criativa',
  },
  class: {
    name: 'Turma inicial',
    meetings: [{ id: 'meeting', startsAt: '2026-10-02T13:00:00.000Z', endsAt: '2026-10-02T15:00:00.000Z', location: 'Ateliê Modelagem' }],
  },
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/inscricoes/cancelar/${token}`]}>
      <Routes>
        <Route path="/inscricoes/cancelar/:token" element={<EnrollmentCancellationPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EnrollmentCancellationPage', () => {
  beforeEach(() => {
    getCancellationMock.mockReset()
    cancelEnrollmentMock.mockReset()
  })

  it('loads the enrollment and cancels it using the URL token', async () => {
    const user = userEvent.setup()
    getCancellationMock.mockResolvedValue({ data: enrollment })
    cancelEnrollmentMock.mockResolvedValue({
      data: { ...enrollment, status: 'CANCELADA' },
    })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Olá, Maria Artesã.' })).toBeInTheDocument()
    expect(screen.getByText('Cerâmica fria criativa')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar minha inscrição' }))

    expect(cancelEnrollmentMock).toHaveBeenCalledWith(token)
    expect(await screen.findByRole('heading', { name: 'Inscrição cancelada.' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar minha inscrição' })).not.toBeInTheDocument()
  })

  it('shows a useful error for an unavailable link', async () => {
    getCancellationMock.mockRejectedValue(new Error('Link de cancelamento inválido ou expirado.'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Link de cancelamento inválido ou expirado.')
  })
})
