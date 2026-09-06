import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import {
  getEnrollmentPayment,
  simulateEnrollmentPayment,
} from '../services/payment-service'
import type { EnrollmentPayment } from '../types/payment'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export function EnrollmentPaymentPage() {
  const { token = '' } = useParams()
  const [enrollment, setEnrollment] = useState<EnrollmentPayment>()
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()
    getEnrollmentPayment(token, controller.signal)
      .then(({ data }) => setEnrollment(data))
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError')
          setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [token])

  async function handlePayment() {
    setIsPaying(true)
    setError(undefined)
    try {
      const response = await simulateEnrollmentPayment(token)
      setEnrollment(response.data)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível registrar o pagamento.',
      )
    } finally {
      setIsPaying(false)
    }
  }

  const isPaid = enrollment?.paymentStatus === 'PAGO'

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] px-5 py-12 sm:py-16" id="conteudo">
        <div className="mx-auto max-w-2xl">
          {isLoading && (
            <div className="h-96 animate-loading loading-surface" role="status">
              <span className="sr-only">Carregando pagamento...</span>
            </div>
          )}
          {!isLoading && !enrollment && (
            <EmptyState
              title="Link de pagamento indisponível"
              description={
                error ?? 'Este link é inválido ou não está mais disponível.'
              }
              role="alert"
            />
          )}
          {!isLoading && enrollment && (
            <section
              className="border border-rule bg-paper p-6 shadow-craft sm:p-8"
              aria-labelledby="payment-title"
            >
              <p className="font-mono text-xs tracking-wider text-ochre uppercase">
                Pagamento ilustrativo
              </p>
              <h1
                className="mt-2 font-display text-3xl font-bold text-carbon sm:text-4xl"
                id="payment-title"
              >
                {isPaid ? 'Pagamento registrado.' : `Olá, ${enrollment.name}.`}
              </h1>
              <p className="mt-3 leading-relaxed text-muted">
                {isPaid
                  ? 'A equipe recebeu o aviso e agora poderá confirmar sua inscrição.'
                  : 'Esta tela apenas simula um pagamento PIX para fins acadêmicos. Nenhum valor real será cobrado.'}
              </p>
              <dl className="mt-7 grid gap-5 border-y border-rule py-6 sm:grid-cols-2">
                <div>
                  <dt className={labelStyles}>Oficina</dt>
                  <dd className="mt-1 font-bold text-carbon">
                    {enrollment.workshop.title}
                  </dd>
                </div>
                <div>
                  <dt className={labelStyles}>Turma</dt>
                  <dd className="mt-1 font-bold text-carbon">
                    {enrollment.class.name}
                  </dd>
                </div>
                <div>
                  <dt className={labelStyles}>Valor simulado</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-carbon">
                    {currency.format(enrollment.class.price)}
                  </dd>
                </div>
                <div>
                  <dt className={labelStyles}>Situação</dt>
                  <dd className="mt-1 font-bold text-carbon">
                    {isPaid
                      ? 'Pago — aguardando confirmação'
                      : 'Aguardando pagamento'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className={labelStyles}>Encontros incluídos</dt>
                  <dd className="mt-2">
                    <ul className="space-y-2">
                      {enrollment.class.meetings.map((meeting) => (
                        <li key={meeting.id} className="text-sm text-muted">
                          {date.format(new Date(meeting.startsAt))} —{' '}
                          {meeting.location}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              {error && (
                <p
                  className="mt-5 border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  className="text-center font-mono text-xs font-bold tracking-wider text-blue uppercase underline decoration-saffron decoration-2 underline-offset-4"
                  to="/"
                >
                  Voltar às oficinas
                </Link>
                {!isPaid && (
                  <Button onClick={handlePayment} disabled={isPaying}>
                    {isPaying ? 'Registrando...' : 'Simular pagamento PIX'}
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

const labelStyles = 'font-mono text-xs uppercase tracking-wider text-muted'
