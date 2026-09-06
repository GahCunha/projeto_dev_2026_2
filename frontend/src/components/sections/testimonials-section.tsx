import { useEffect, useState } from 'react'
import { pagePadding } from '../../lib/styles'
import { cn } from '../../lib/utils'
import { Eyebrow } from '../ui/eyebrow'

const testimonials = [
  {
    quote:
      'Eu cheguei dizendo que não levava jeito. Saí com uma peça feita por mim e vontade de continuar aprendendo.',
    name: 'Marina',
    workshop: 'Cerâmica fria criativa',
  },
  {
    quote:
      'O encontro foi leve, paciente e cheio de troca. Pela primeira vez, consegui terminar um projeto de crochê.',
    name: 'Clara',
    workshop: 'Crochê: primeiros pontos',
  },
  {
    quote:
      'Aprender junto tornou tudo mais simples. A peça ficou na minha sala e sempre rende uma boa história.',
    name: 'Rafael',
    workshop: 'Carpintaria para iniciantes',
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [paused])

  function next() {
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  function previous() {
    setActiveIndex(
      (current) => (current - 1 + testimonials.length) % testimonials.length,
    )
  }

  return (
    <section
      className={`relative isolate z-0 overflow-hidden border-b border-rule bg-paper py-10 lg:py-12 ${pagePadding}`}
      id="depoimentos"
      aria-labelledby="testimonials-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <Eyebrow>Histórias da bancada</Eyebrow>
            <h2
              className="m-0 max-w-xl font-display text-3xl -tracking-wide text-balance text-carbon sm:text-4xl md:text-5xl"
              id="testimonials-title"
            >
              O que fica depois do encontro.
            </h2>
          </div>
          <p className="m-0 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Mais do que aprender uma técnica, cada oficina deixa uma peça, uma
            memória e coragem para criar a próxima.
          </p>
        </div>

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[300px] sm:h-[290px]">
            {testimonials.map((testimonial, index) => {
              const position =
                (index - activeIndex + testimonials.length) %
                testimonials.length
              const isActive = position === 0
              const isNext = position === 1
              const isPrevious = position === testimonials.length - 1

              return (
                <figure
                  className={cn(
                    'absolute top-1/2 left-1/2 m-0 w-[88%] max-w-2xl border bg-light p-6 shadow-craft transition duration-700 ease-out sm:p-8',
                    isActive &&
                      'z-30 -translate-x-1/2 -translate-y-1/2 scale-100 rotate-0 border-carbon opacity-100',
                    isNext &&
                      'z-20 -translate-x-[47%] -translate-y-[46%] scale-[0.94] rotate-2 border-rule opacity-40',
                    isPrevious &&
                      'z-10 -translate-x-[53%] -translate-y-[54%] scale-[0.92] -rotate-2 border-rule opacity-25',
                  )}
                  key={`${testimonial.name}-${testimonial.workshop}`}
                  aria-hidden={!isActive}
                >
                  <span
                    className={cn(
                      'absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 bg-tape/90 shadow-sm transition-transform duration-700',
                      isActive ? 'rotate-1' : '-rotate-3',
                    )}
                    aria-hidden="true"
                  />
                  <span className="mb-5 block font-mono text-xs tracking-widest text-muted uppercase">
                    história {String(index + 1).padStart(2, '0')}
                  </span>
                  <blockquote className="m-0 font-display text-xl leading-relaxed text-balance text-carbon sm:text-2xl md:text-3xl">
                    <span
                      className="mr-1 font-serif text-3xl text-ochre"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    {testimonial.quote}
                    <span
                      className="ml-1 font-serif text-3xl text-ochre"
                      aria-hidden="true"
                    >
                      ”
                    </span>
                  </blockquote>
                  <figcaption className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 border-t border-dashed border-rule pt-4">
                    <strong className="font-display text-lg leading-none whitespace-nowrap text-carbon">
                      {testimonial.name}
                    </strong>
                    <span className="min-w-0 justify-self-end text-right font-mono text-xs leading-relaxed tracking-wider text-muted uppercase">
                      {testimonial.workshop}
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-5 sm:mt-10">
            <button
              className="flex size-11 items-center justify-center rounded-full border border-rule text-carbon transition hover:-translate-x-0.5 hover:border-carbon hover:bg-light"
              type="button"
              onClick={previous}
              aria-label="Depoimento anterior"
            >
              ←
            </button>
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Selecionar depoimento"
            >
              {testimonials.map((testimonial, index) => (
                <button
                  className={cn(
                    'h-2 rounded-full transition-[width,background-color] duration-500',
                    activeIndex === index
                      ? 'w-8 bg-ochre'
                      : 'w-2 bg-rule hover:bg-muted',
                  )}
                  key={testimonial.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver depoimento de ${testimonial.name}`}
                  aria-selected={activeIndex === index}
                  role="tab"
                />
              ))}
            </div>
            <button
              className="flex size-11 items-center justify-center rounded-full border border-rule text-carbon transition hover:translate-x-0.5 hover:border-carbon hover:bg-light"
              type="button"
              onClick={next}
              aria-label="Próximo depoimento"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
