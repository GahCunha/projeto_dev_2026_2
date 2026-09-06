import { pagePadding } from '../../lib/styles'
import { responsiveImageProps } from '../../lib/responsive-image'
import type { Workshop } from '../../types/workshop'
import { buttonVariants } from '../ui/button-variants'
import { Eyebrow } from '../ui/eyebrow'

type HeroSectionProps = {
  workshops: Workshop[]
}

export function HeroSection({ workshops }: HeroSectionProps) {
  return (
    <section
      className={`relative isolate grid min-h-0 scroll-mt-18 grid-cols-1 items-center gap-10 overflow-hidden border-b border-rule py-12 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-14 ${pagePadding}`}
      id="inicio"
    >
      <div
        className="absolute -right-20 bottom-8 h-44 w-3/5 rotate-6 animate-thread-in rounded-full border-t-2 border-dashed border-blue/55 max-lg:hidden"
        aria-hidden="true"
      />

      <div className="relative z-2 max-w-xl min-w-0">
        <Eyebrow dot>Ateliê aberto</Eyebrow>
        <h1 className="mb-5 flex flex-col font-display text-5xl leading-[1.08] font-bold tracking-tight text-balance text-carbon sm:text-6xl lg:text-7xl xl:text-8xl">
          Faça algo
          <em className="my-1 ml-16 font-serif text-4xl font-normal -tracking-wide text-ochre sm:ml-20 sm:text-5xl lg:text-6xl">
            que
          </em>
          fique.
        </h1>
        <p className="mb-6 max-w-lg border-l-2 border-rule pl-4 text-lg leading-relaxed text-muted">
          Oficinas para aprender um ofício, encontrar pessoas e levar uma peça
          para casa. Desconecte-se das telas e conecte-se com as mãos.
        </p>
        <a className={buttonVariants()} href="#oficinas">
          Ver próximas oficinas <span aria-hidden="true">→</span>
        </a>
      </div>

      <div
        className="relative min-h-80 sm:min-h-112 lg:min-h-136"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 z-10 h-[48%] w-[46%] -rotate-6 border border-carbon bg-light p-2 shadow-photo saturate-75 transition-transform duration-300 hover:z-40 hover:scale-[1.03] hover:rotate-0 max-sm:top-3">
          {workshops[2]?.imageUrl ? (
            <img
              className="block h-full w-full object-cover"
              {...responsiveImageProps(
                workshops[2].imageUrl,
                '(max-width: 640px) 45vw, 25vw',
                [320, 480, 640],
              )}
              alt=""
              width="420"
              height="360"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full" />
          )}
          <span className="absolute -top-3 left-[42%] h-6 w-20 -translate-x-1/2 -rotate-5 bg-tape/90 shadow-sm" />
        </div>

        <div className="absolute top-[10%] left-[17%] z-20 h-[76%] w-[68%] -rotate-2 border border-carbon bg-light p-2 shadow-photo transition-transform duration-300 hover:z-40 hover:scale-[1.02] hover:rotate-0 max-sm:left-[10%] max-sm:w-[76%]">
          {workshops[0]?.imageUrl ? (
            <img
              className="block h-full w-full object-cover"
              {...responsiveImageProps(
                workshops[0].imageUrl,
                '(max-width: 1024px) 75vw, 40vw',
                [640, 960, 1280],
              )}
              alt=""
              width="800"
              height="700"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full" />
          )}
          <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm" />
        </div>

        <div className="absolute right-0 bottom-0 z-30 h-[45%] w-[44%] rotate-5 border border-carbon bg-light p-2 shadow-photo saturate-50 transition-transform duration-300 hover:z-40 hover:scale-[1.03] hover:rotate-0">
          {workshops[1]?.imageUrl ? (
            <img
              className="block h-full w-full object-cover"
              {...responsiveImageProps(
                workshops[1].imageUrl,
                '(max-width: 640px) 45vw, 25vw',
                [320, 480, 640],
              )}
              alt=""
              width="420"
              height="360"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full" />
          )}
          <span className="absolute -top-3 left-[58%] h-6 w-20 -translate-x-1/2 rotate-6 bg-tape/90 shadow-sm" />
        </div>
      </div>
    </section>
  )
}
