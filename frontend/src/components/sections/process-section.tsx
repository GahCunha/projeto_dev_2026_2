import type { ReactNode } from 'react'
import { pagePadding } from '../../lib/styles'
import { Eyebrow } from '../ui/eyebrow'

export function ProcessSection() {
  return (
    <section className={`grid scroll-mt-18 grid-cols-1 gap-10 border-y border-rule bg-deep py-12 lg:grid-cols-5 lg:gap-20 lg:py-20 ${pagePadding}`} id="como-funciona" aria-labelledby="process-title">
      <div className="lg:col-span-2">
        <Eyebrow>Do interesse à bancada</Eyebrow>
        <h2 className="m-0 font-display text-4xl -tracking-wide text-carbon md:text-5xl" id="process-title">O processo.</h2>
        <p className="mt-4 max-w-md leading-relaxed text-muted">Sem experiência prévia necessária. Você traz a vontade de criar; nós preparamos o restante.</p>
      </div>
      <ol className="m-0 grid list-none grid-cols-3 gap-8 p-0 max-sm:grid-cols-1 lg:col-span-3">
        <ProcessItem number="01" title="Escolha">Encontre a oficina que desperta sua curiosidade.</ProcessItem>
        <ProcessItem number="02" title="Prepare">Confira os materiais indicados e reserve algumas horas.</ProcessItem>
        <ProcessItem number="03" title="Participe">Aprenda fazendo e leve uma nova história para casa.</ProcessItem>
      </ol>
    </section>
  )
}

function ProcessItem({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <li className="border-t border-rule pt-2"><span className="font-mono text-xs text-ochre">{number}</span><h3 className="my-6 mb-2 font-display text-2xl text-carbon">{title}</h3><p className="leading-relaxed text-muted">{children}</p></li>
}
