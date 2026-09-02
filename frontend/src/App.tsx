import { useEffect, useState } from 'react'
import { getWorkshops } from './services/workshop-service'
import type { Workshop } from './types/workshop'

function App() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getWorkshops(controller.signal)
      .then((response) => setWorkshops(response.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [requestKey])

  function retry() {
    setError(null)
    setIsLoading(true)
    setRequestKey((currentKey) => currentKey + 1)
  }

  return (
    <main>
      <h1>Feito à Mão</h1>

      <section aria-labelledby="workshops-title">
        <h2 id="workshops-title">Próximas oficinas</h2>

        {isLoading && <p>Carregando oficinas...</p>}

        {!isLoading && error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry}>
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !error && workshops.length === 0 && (
          <p>Ainda não há novas oficinas.</p>
        )}

        {!isLoading && !error && workshops.length > 0 && (
          <ul>
            {workshops.map((workshop) => (
              <li key={workshop.id}>
                <article>
                  <p>{workshop.category}</p>
                  <h3>{workshop.title}</h3>
                  <p>{workshop.description}</p>
                  <p>{new Date(workshop.startsAt).toLocaleString('pt-BR')}</p>
                  <p>{workshop.location}</p>
                  <p>{workshop.availableSeats} vagas disponíveis</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
