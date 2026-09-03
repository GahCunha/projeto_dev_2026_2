import { pagePadding } from '../../lib/styles'
import type { Workshop } from '../../types/workshop'
import { buttonVariants } from '../ui/button-variants'
import { Eyebrow } from '../ui/eyebrow'

type HeroSectionProps = {
  workshops: Workshop[]
}

export function HeroSection({ workshops }: HeroSectionProps) {
  return (
    <section className={`relative grid min-h-0 scroll-mt-18 grid-cols-1 items-center gap-10 overflow-hidden border-b border-rule py-12 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-2 lg:gap-20 lg:py-14 ${pagePadding}`} id="inicio">
      <div className="animate-thread-in absolute -right-20 bottom-8 h-44 w-3/5 rotate-6 rounded-full border-t-2 border-dashed border-blue/55 max-lg:hidden" aria-hidden="true" />
      <div className="relative z-2 min-w-0 max-w-xl">
        <Eyebrow dot>Ateliê aberto</Eyebrow>
        <h1 className="mb-5 flex flex-col text-balance font-display text-5xl leading-[1.08] font-bold tracking-tight text-carbon sm:text-6xl lg:text-7xl xl:text-8xl">
          Faça algo
          <em className="my-1 ml-16 font-serif text-4xl font-normal -tracking-wide text-ochre sm:ml-20 sm:text-5xl lg:text-6xl">que</em>
          fique.
        </h1>
        <p className="mb-6 max-w-lg border-l-2 border-rule pl-4 text-lg leading-relaxed text-muted">
          Oficinas para aprender um ofício, encontrar pessoas e levar uma peça para casa.
          Desconecte-se das telas e conecte-se com as mãos.
        </p>
        <a className={buttonVariants()} href="#oficinas">Ver próximas oficinas <span aria-hidden="true">→</span></a>
      </div>

      <div className="relative min-h-72 sm:min-h-96 lg:min-h-112" aria-hidden="true">
        <div className="absolute inset-y-4 right-12 left-2 -rotate-2 border border-carbon bg-light p-2 shadow-photo max-sm:right-6 max-sm:left-0">
          {workshops[0]?.imageUrl ? <img className="block h-full w-full object-cover" src={workshops[0].imageUrl} alt="" width="800" height="700" fetchPriority="high" /> : <div className="h-full w-full" />}
          <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm" />
        </div>
        <div className="absolute right-0 bottom-8 -z-1 h-2/5 w-2/5 rotate-3 border border-carbon bg-light p-2 shadow-photo saturate-50">
          {workshops[1]?.imageUrl ? <img className="block h-full w-full object-cover" src={workshops[1].imageUrl} alt="" width="420" height="360" /> : <div className="h-full w-full" />}
        </div>
      </div>
    </section>
  )
}
