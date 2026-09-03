import { Button } from '../ui/button'

type ConfirmationDialogProps = {
  title: string
  description: string
  confirmLabel: string
  isSubmitting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationDialog({ title, description, confirmLabel, isSubmitting, onConfirm, onClose }: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-carbon/65 p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-md border border-rule bg-paper p-6 shadow-photo" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Confirmar alteração</p>
        <h2 className="font-display text-2xl font-bold text-carbon" id="confirmation-title">{title}</h2>
        <p className="mt-3 leading-relaxed text-muted" id="confirmation-description">{description}</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Voltar</Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : confirmLabel}</Button>
        </div>
      </section>
    </div>
  )
}
