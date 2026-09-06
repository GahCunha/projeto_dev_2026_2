import { useState, type FormEvent } from 'react'
import { createEnrollment } from '../services/enrollment-service'
import type { PaymentStatus } from '../types/enrollment'
import { Button } from './ui/button'
import { Eyebrow } from './ui/eyebrow'

type EnrollmentFormProps = {
  classId: string
  hasAvailableSeats: boolean
  onCreated: () => void
}

export function EnrollmentForm({
  classId,
  hasAvailableSeats,
  onCreated,
}: EnrollmentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    if (normalizedName.length < 3) {
      setError('Informe um nome com pelo menos 3 caracteres.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setPaymentStatus(undefined)

    try {
      const response = await createEnrollment({
        name: normalizedName,
        email: normalizedEmail,
        classId,
      })
      setName('')
      setEmail('')
      setPaymentStatus(response.data.paymentStatus)
      onCreated()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível realizar a inscrição.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasAvailableSeats) {
    return <p role="status">Esta oficina está sem vagas disponíveis.</p>
  }

  return (
    <form
      className="relative grid gap-5 border border-carbon bg-light p-6 before:absolute before:-top-2 before:right-10 before:h-4 before:w-20 before:-rotate-1 before:bg-tape/80 md:p-10"
      onSubmit={handleSubmit}
    >
      <div className="mb-2 border-b border-rule pb-5">
        <Eyebrow className="mb-2">Sua vaga começa aqui</Eyebrow>
        <h3 className="mb-3 font-display text-3xl text-carbon md:text-4xl">
          Ficha de inscrição
        </h3>
        <p className="m-0 leading-relaxed text-muted">
          Preencha seus dados. A equipe confirmará sua participação em seguida.
        </p>
      </div>

      <div className="grid gap-2">
        <label
          className="font-mono text-xs tracking-widest uppercase"
          htmlFor={`name-${classId}`}
        >
          Nome completo
        </label>
        <input
          className="min-h-12 w-full rounded-none border-0 border-b-2 border-rule bg-white px-3.5 py-3 text-ink focus:border-blue"
          id={`name-${classId}`}
          name="name"
          type="text"
          minLength={3}
          maxLength={120}
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="font-mono text-xs tracking-widest uppercase"
          htmlFor={`email-${classId}`}
        >
          E-mail
        </label>
        <input
          className="min-h-12 w-full rounded-none border-0 border-b-2 border-rule bg-white px-3.5 py-3 text-ink focus:border-blue"
          id={`email-${classId}`}
          name="email"
          type="email"
          spellCheck={false}
          maxLength={254}
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <Button
        className="mt-2"
        size="full"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando…' : 'Quero participar'}
      </Button>

      {error && (
        <p
          className="m-0 border-l-3 border-current bg-deep px-4 py-3 text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      {paymentStatus && (
        <p
          className="m-0 border-l-3 border-current bg-deep px-4 py-3 text-success"
          role="status"
          aria-live="polite"
        >
          {paymentStatus === 'PENDENTE'
            ? 'Inscrição recebida. Enviamos por e-mail o link para simular o pagamento PIX.'
            : 'Inscrição recebida. Agora ela será analisada pela equipe.'}
        </p>
      )}
    </form>
  )
}
