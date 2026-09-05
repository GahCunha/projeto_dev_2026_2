import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/empty-state'
import { cancelEnrollment, getEnrollmentCancellation } from '../services/cancellation-service'
import type { EnrollmentCancellation } from '../types/cancellation'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export function EnrollmentCancellationPage() {
  const { token = '' } = useParams()
  const [enrollment, setEnrollment] = useState<EnrollmentCancellation>()
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    getEnrollmentCancellation(token, controller.signal)
      .then((response) => setEnrollment(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [token])

  async function handleCancellation() {
    setIsCanceling(true)
    setError(undefined)

    try {
      const response = await cancelEnrollment(token)
      setEnrollment(response.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível cancelar a inscrição.')
    } finally {
      setIsCanceling(false)
    }
  }

  const isCanceled = enrollment?.status === 'CANCELADA'

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] px-5 py-12 sm:py-16" id="conteudo">
        <div className="mx-auto max-w-2xl">
          {isLoading && <CancellationSkeleton />}

          {!isLoading && !enrollment && (
            <EmptyState
              title="Link de cancelamento indisponível"
              description={error ?? 'Este link é inválido ou não está mais disponível.'}
              role="alert"
              action={<Link className="font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" to="/">Ver oficinas</Link>}
            />
          )}

          {!isLoading && enrollment && (
            <section className="border border-rule bg-paper p-6 shadow-craft sm:p-8" aria-labelledby="cancellation-title">
              <p className="font-mono text-xs uppercase tracking-wider text-ochre">Sua inscrição</p>
              <h1 className="mt-2 text-balance font-display text-3xl font-bold text-carbon sm:text-4xl" id="cancellation-title">
                {isCanceled ? 'Inscrição cancelada.' : `Olá, ${enrollment.name}.`}
              </h1>
              <p className="mt-3 text-pretty leading-relaxed text-muted">
                {isCanceled
                  ? 'A vaga foi liberada e você não precisa fazer mais nada.'
                  : 'Confira os dados abaixo antes de cancelar. Ao confirmar, sua vaga ficará disponível para outra pessoa.'}
              </p>

              <dl className="mt-7 grid gap-5 border-y border-rule py-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className={labelStyles}>Oficina</dt>
                  <dd className="mt-1 font-display text-xl font-bold text-carbon">{enrollment.workshop.title}</dd>
                </div>
                <div>
                  <dt className={labelStyles}>Data e horário</dt>
                  <dd className="mt-1 text-sm font-bold text-carbon">{dateFormatter.format(new Date(enrollment.workshop.startsAt))}</dd>
                </div>
                <div>
                  <dt className={labelStyles}>Local</dt>
                  <dd className="mt-1 text-sm font-bold text-carbon">{enrollment.workshop.location}</dd>
                </div>
              </dl>

              {error && <p className="mt-5 border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link className="text-center font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" to="/">Voltar às oficinas</Link>
                {!isCanceled && <Button onClick={handleCancellation} disabled={isCanceling}>{isCanceling ? 'Cancelando...' : 'Cancelar minha inscrição'}</Button>}
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

function CancellationSkeleton() {
  return (
    <div className="space-y-5 border border-rule bg-paper p-6" role="status" aria-label="Carregando inscrição">
      <div className="loading-surface h-3 w-1/4 animate-loading" />
      <div className="loading-surface h-10 w-3/4 animate-loading" />
      <div className="loading-surface h-20 animate-loading" />
      <span className="sr-only">Carregando inscrição...</span>
    </div>
  )
}
