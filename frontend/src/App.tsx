import { useEffect, useState } from 'react'
import { EnrollmentForm } from './components/enrollment-form'
import { getWorkshops } from './services/workshop-service'
import type { Workshop } from './types/workshop'

function App() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)

  const selectedWorkshop = workshops.find(
    (workshop) => workshop.id === selectedWorkshopId,
  )

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
                  <button type="button" onClick={() => setSelectedWorkshopId(workshop.id)}>
                    Ver oficina
                  </button>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedWorkshop && (
        <section aria-labelledby="selected-workshop-title">
          <button type="button" onClick={() => setSelectedWorkshopId(null)}>
            Voltar para oficinas
          </button>

          <p>{selectedWorkshop.category}</p>
          <h2 id="selected-workshop-title">{selectedWorkshop.title}</h2>
          <p>{selectedWorkshop.description}</p>
          <p>{new Date(selectedWorkshop.startsAt).toLocaleString('pt-BR')}</p>
          <p>Duração: {selectedWorkshop.durationMin} minutos</p>
          <p>Local: {selectedWorkshop.location}</p>
          <p>{selectedWorkshop.availableSeats} vagas disponíveis</p>

          <h3>Materiais necessários</h3>
          {selectedWorkshop.materials.length > 0 ? (
            <ul>
              {selectedWorkshop.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          ) : (
            <p>Nenhum material precisa ser levado.</p>
          )}

          <EnrollmentForm
            key={selectedWorkshop.id}
            workshopId={selectedWorkshop.id}
            hasAvailableSeats={selectedWorkshop.availableSeats > 0}
            onCreated={() => setRequestKey((currentKey) => currentKey + 1)}
          />
        </section>
      )}
    </main>
  )
}

export default App
