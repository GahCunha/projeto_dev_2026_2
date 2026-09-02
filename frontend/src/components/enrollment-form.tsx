import { useState, type FormEvent } from 'react'
import { createEnrollment } from '../services/enrollment-service'

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
    <form onSubmit={handleSubmit}>
      <h3>Inscrição</h3>

      <div>
        <label htmlFor={`name-${workshopId}`}>Nome completo</label>
        <input
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

      <div>
        <label htmlFor={`email-${workshopId}`}>E-mail</label>
        <input
          id={`email-${workshopId}`}
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Quero participar'}
      </button>

      {error && <p role="alert">{error}</p>}
      {success && (
        <p role="status">Inscrição recebida. Agora ela será analisada pela equipe.</p>
      )}
    </form>
  )
}
