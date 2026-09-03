import type { ReactNode } from 'react'
import { pagePadding } from '../../lib/styles'
import type { Workshop } from '../../types/workshop'
import { EnrollmentForm } from '../enrollment-form'
import { Button } from '../ui/button'
import { ImageFallback } from '../ui/image-fallback'

type WorkshopDetailsSectionProps = {
  workshop: Workshop
  onClose: () => void
  onEnrollmentCreated: () => void
}

export function WorkshopDetailsSection({ workshop, onClose, onEnrollmentCreated }: WorkshopDetailsSectionProps) {
  return (
    <section className={`grid scroll-mt-18 grid-cols-1 gap-10 border-t border-rule py-12 lg:grid-cols-5 lg:gap-20 lg:py-20 ${pagePadding}`} id="detalhes" aria-labelledby="selected-workshop-title">
      <div className="lg:col-span-3">
        <Button className="mb-8" variant="ghost" onClick={onClose}>← Voltar para oficinas</Button>

        <div className="relative mb-10 h-80 border border-carbon bg-light p-2 shadow-offset sm:h-96 md:h-116">
          {workshop.imageUrl ? <img className="block h-full w-full object-cover" src={workshop.imageUrl} alt={`Oficina ${workshop.title}`} width="960" height="640" loading="lazy" /> : <ImageFallback />}
          <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm" aria-hidden="true" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="justify-self-start bg-green px-2.5 py-1.5 font-mono text-xs uppercase tracking-widest text-white">{workshop.category}</span>
          <span className="ml-auto font-mono text-xs text-ochre before:mr-2 before:inline-block before:size-1.5 before:rounded-full before:bg-current">{workshop.availableSeats} lugares disponíveis</span>
          <h2 className="my-3 mb-6 w-full font-display text-4xl leading-none -tracking-wider text-carbon md:text-6xl" id="selected-workshop-title">{workshop.title}</h2>
        </div>

        <dl className="grid grid-cols-3 gap-4 border-y border-rule py-6 max-sm:grid-cols-2">
          <Fact label="Data">{new Date(workshop.startsAt).toLocaleString('pt-BR')}</Fact>
          <Fact label="Duração">{workshop.durationMin} minutos</Fact>
          <Fact className="max-sm:col-span-full" label="Localização">{workshop.location}</Fact>
        </dl>

        <p className="my-8 text-lg leading-relaxed text-muted">{workshop.description}</p>

        <div className="relative mt-12 border border-rule bg-deep px-6 pt-8 pb-5">
          <span className="absolute -top-3 left-5 bg-paper px-2 py-1 font-mono text-xs uppercase tracking-widest text-blue">Lista de materiais</span>
          {workshop.materials.length > 0 ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {workshop.materials.map((material) => (
                <li className="flex gap-3" key={material}><span className="grid size-5 shrink-0 place-items-center border border-green text-xs text-green" aria-hidden="true">✓</span>{material}</li>
              ))}
            </ul>
          ) : <p>Nenhum material precisa ser levado.</p>}
        </div>
      </div>

      <aside className="relative self-start shadow-craft lg:col-span-2 lg:mt-14">
        <EnrollmentForm key={workshop.id} workshopId={workshop.id} hasAvailableSeats={workshop.availableSeats > 0} onCreated={onEnrollmentCreated} />
      </aside>
    </section>
  )
}

function Fact({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><dt className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">{label}</dt><dd className="m-0">{children}</dd></div>
}
