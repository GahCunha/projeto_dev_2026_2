import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ClassFormPanel } from './class-form-panel'

describe('ClassFormPanel', () => {
  it('submits a class with multiple meetings and a price in reais', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <ClassFormPanel
        workshopTitle="Crochê: primeiros pontos"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Nome da turma'), 'Turma das quartas')
    await user.clear(screen.getByLabelText('Vagas'))
    await user.type(screen.getByLabelText('Vagas'), '10')
    await user.clear(screen.getByLabelText('Preço em reais'))
    await user.type(screen.getByLabelText('Preço em reais'), '85.50')

    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2026-10-07T19:00' } })
    fireEvent.change(screen.getByLabelText('Término'), { target: { value: '2026-10-07T21:00' } })
    await user.type(screen.getByLabelText('Local'), 'Ateliê Têxtil')

    await user.click(screen.getByRole('button', { name: 'Adicionar aula' }))
    const starts = screen.getAllByLabelText('Início')
    const ends = screen.getAllByLabelText('Término')
    const locations = screen.getAllByLabelText('Local')
    fireEvent.change(starts[1], { target: { value: '2026-10-14T19:00' } })
    fireEvent.change(ends[1], { target: { value: '2026-10-14T21:00' } })
    await user.type(locations[1], 'Ateliê Têxtil')

    await user.click(screen.getByRole('button', { name: 'Criar turma' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Turma das quartas',
      capacity: 10,
      price: 85.5,
      meetings: [
        {
          startsAt: new Date('2026-10-07T19:00').toISOString(),
          endsAt: new Date('2026-10-07T21:00').toISOString(),
          location: 'Ateliê Têxtil',
        },
        {
          startsAt: new Date('2026-10-14T19:00').toISOString(),
          endsAt: new Date('2026-10-14T21:00').toISOString(),
          location: 'Ateliê Têxtil',
        },
      ],
    })
  })

  it('keeps at least one meeting in the form', () => {
    render(<ClassFormPanel workshopTitle="Cerâmica" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Remover' })).toBeDisabled()
  })
})
