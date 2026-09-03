import { useState, type FormEvent } from 'react'
import { createEnrollment } from '../services/enrollment-service'
import { Button } from './ui/button'
import { Eyebrow } from './ui/eyebrow'

type EnrollmentFormProps = {
  workshopId: string
  hasAvailableSeats: boolean
  onCreated: () => void
}

export function EnrollmentForm({
  workshopId,
  hasAvailableSeats,
  onCreated,
}: EnrollmentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)

    try {
      await createEnrollment({
        name: normalizedName,
        email: normalizedEmail,
        workshopId,
      })
      setName('')
      setEmail('')
      setSuccess(true)
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
    <form className="relative grid gap-5 border border-carbon bg-light p-6 md:p-10 before:absolute before:-top-2 before:right-10 before:h-4 before:w-20 before:-rotate-1 before:bg-tape/80" onSubmit={handleSubmit}>
      <div className="mb-2 border-b border-rule pb-5">
        <Eyebrow className="mb-2">Sua vaga começa aqui</Eyebrow>
        <h3 className="mb-3 font-display text-3xl text-carbon md:text-4xl">Ficha de inscrição</h3>
        <p className="m-0 leading-relaxed text-muted">Preencha seus dados. A equipe confirmará sua participação em seguida.</p>
      </div>

      <div className="grid gap-2">
        <label className="font-mono text-xs uppercase tracking-widest" htmlFor={`name-${workshopId}`}>Nome completo</label>
        <input
          className="min-h-12 w-full rounded-none border-0 border-b-2 border-rule bg-white px-3.5 py-3 text-ink focus:border-blue"
          id={`name-${workshopId}`}
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
        <label className="font-mono text-xs uppercase tracking-widest" htmlFor={`email-${workshopId}`}>E-mail</label>
        <input
          className="min-h-12 w-full rounded-none border-0 border-b-2 border-rule bg-white px-3.5 py-3 text-ink focus:border-blue"
          id={`email-${workshopId}`}
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

      <Button className="mt-2" size="full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : 'Quero participar'}
      </Button>

      {error && <p className="m-0 border-l-3 border-current bg-deep px-4 py-3 text-danger" role="alert" aria-live="polite">{error}</p>}
      {success && (
        <p className="m-0 border-l-3 border-current bg-deep px-4 py-3 text-success" role="status" aria-live="polite">
          Inscrição recebida. Agora ela será analisada pela equipe.
        </p>
      )}
    </form>
  )
}
