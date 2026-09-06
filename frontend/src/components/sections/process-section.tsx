import type { ReactNode } from 'react'
import { pagePadding } from '../../lib/styles'
import { Eyebrow } from '../ui/eyebrow'

export function ProcessSection() {
  return (
    <section
      className={`grid scroll-mt-18 grid-cols-1 gap-10 border-y border-rule bg-deep py-12 lg:grid-cols-5 lg:gap-16 lg:py-16 ${pagePadding}`}
      id="como-funciona"
      aria-labelledby="process-title"
    >
      <div className="lg:col-span-2">
        <Eyebrow>Do interesse à bancada</Eyebrow>
        <h2
          className="m-0 font-display text-4xl -tracking-wide text-carbon md:text-5xl"
          id="process-title"
        >
          O processo.
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          Sem experiência prévia necessária. Você traz a vontade de criar; nós
          preparamos o restante.
        </p>
      </div>
      <ol className="relative m-0 grid list-none gap-6 p-0 before:absolute before:top-5 before:bottom-5 before:left-5 before:border-l before:border-dashed before:border-blue/60 sm:grid-cols-3 sm:gap-8 sm:before:right-5 sm:before:bottom-auto sm:before:border-t sm:before:border-l-0 lg:col-span-3">
        <ProcessItem number="01" title="Escolha">
          Encontre a oficina que desperta sua curiosidade.
        </ProcessItem>
        <ProcessItem number="02" title="Prepare">
          Confira os materiais indicados e reserve algumas horas.
        </ProcessItem>
        <ProcessItem number="03" title="Participe">
          Aprenda fazendo e leve uma nova história para casa.
        </ProcessItem>
      </ol>
    </section>
  )
}

function ProcessItem({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 sm:block">
      <span className="relative z-1 grid size-10 place-items-center rounded-full border border-ochre bg-deep font-mono text-xs font-bold text-ochre shadow-craft-sm">
        {number}
      </span>
      <div>
        <h3 className="mt-1 mb-2 font-display text-2xl text-carbon sm:mt-5">
          {title}
        </h3>
        <p className="m-0 max-w-xs leading-relaxed text-muted">{children}</p>
      </div>
    </li>
  )
}
