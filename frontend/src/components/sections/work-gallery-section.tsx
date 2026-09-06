import { useState } from 'react'
import { pagePadding } from '../../lib/styles'
import { responsiveImageProps } from '../../lib/responsive-image'
import type { Workshop } from '../../types/workshop'
import { Eyebrow } from '../ui/eyebrow'

type WorkGallerySectionProps = {
  workshops: Workshop[]
}

export function WorkGallerySection({ workshops }: WorkGallerySectionProps) {
  const galleryItems = workshops
    .filter((workshop) => workshop.imageUrl)
    .slice(0, 6)

  const [activeIndex, setActiveIndex] = useState(0)

  if (galleryItems.length === 0) return null

  const activeWorkshop = galleryItems[activeIndex] ?? galleryItems[0]

  const previous = () => {
    setActiveIndex((current) =>
      current === 0 ? galleryItems.length - 1 : current - 1,
    )
  }

  const next = () => {
    setActiveIndex((current) =>
      current === galleryItems.length - 1 ? 0 : current + 1,
    )
  }

  return (
    <section
      id="galeria"
      className={`overflow-hidden border-b border-rule bg-deep py-12 lg:py-18 ${pagePadding} `}
      aria-labelledby="gallery-title"
    >
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-8 grid gap-5 border-b border-rule pb-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <Eyebrow>Feito por muitas mãos</Eyebrow>

            <h2
              id="gallery-title"
              className="m-0 max-w-2xl font-display text-3xl leading-tight -tracking-wide text-balance text-carbon sm:text-4xl md:text-5xl"
            >
              Da matéria à peça.
            </h2>
          </div>

          <p className="m-0 max-w-md text-sm leading-relaxed text-pretty text-muted sm:text-base lg:justify-self-end">
            Um recorte das técnicas, texturas e possibilidades que passam pelas
            nossas bancadas.
          </p>
        </div>

        {/* Galeria principal */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:gap-9">
          {/* Imagem em foco */}
          <div>
            <div className="group relative aspect-[4/3] overflow-visible sm:aspect-[16/10] lg:aspect-[4/3]">
              {/* folha/foto */}
              <div className="absolute inset-0 -rotate-[0.6deg] border border-carbon bg-light p-2 shadow-craft sm:p-3">
                {/* Imagens empilhadas para permitir transição */}
                <div className="relative h-full w-full overflow-hidden bg-paper">
                  {galleryItems.map((workshop, index) => (
                    <img
                      key={workshop.id}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                        activeIndex === index
                          ? `scale-100 opacity-100`
                          : `pointer-events-none scale-[1.025] opacity-0`
                      } `}
                      {...responsiveImageProps(
                        workshop.imageUrl!,
                        '(max-width: 1024px) 100vw, 65vw',
                        [640, 960, 1280, 1600],
                      )}
                      alt={`Peça da oficina ${workshop.title}`}
                      width="1200"
                      height="900"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ))}

                  {/* leve sombra/gradiente inferior */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carbon/35 to-transparent"
                    aria-hidden="true"
                  />
                </div>

                {/* fita adesiva */}
                <span
                  className="absolute -top-3 left-[18%] h-6 w-24 -translate-x-1/2 -rotate-5 bg-tape/90 shadow-sm"
                  aria-hidden="true"
                />

                {/* etiqueta inferior */}
                <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 bg-light/95 px-4 py-3 shadow-craft-sm max-sm:right-4 max-sm:bottom-4 max-sm:left-4">
                  <div className="min-w-0">
                    <span className="mb-1 block font-mono text-[9px] tracking-[0.18em] text-green uppercase">
                      {activeWorkshop.category}
                    </span>

                    <strong className="block truncate font-display text-lg leading-tight text-carbon sm:text-xl">
                      {activeWorkshop.title}
                    </strong>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] tracking-[0.15em] text-muted">
                    {String(activeIndex + 1).padStart(2, '0')}
                    {' / '}
                    {String(galleryItems.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* detalhe decorativo atrás */}
              <div
                className="pointer-events-none absolute -right-4 -bottom-4 -z-10 h-[70%] w-[55%] rotate-2 border border-dashed border-blue/35 max-sm:-right-2 max-sm:-bottom-2"
                aria-hidden="true"
              />
            </div>

            {/* Navegação da foto principal */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                toque nas imagens para explorar
              </span>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={previous}
                  className="group flex size-11 items-center justify-center rounded-full border border-rule text-carbon transition-all duration-300 hover:-translate-x-0.5 hover:border-carbon hover:bg-light"
                  aria-label="Imagem anterior"
                >
                  <span
                    className="transition-transform group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  >
                    ←
                  </span>
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="group flex size-11 items-center justify-center rounded-full border border-rule text-carbon transition-all duration-300 hover:translate-x-0.5 hover:border-carbon hover:bg-light"
                  aria-label="Próxima imagem"
                >
                  <span
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Miniaturas */}
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-center">
            <div className="mb-4 hidden items-center justify-between lg:flex">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                Sobre a bancada
              </span>

              <span className="font-serif text-lg text-ochre italic">
                escolha uma peça
              </span>
            </div>

            {/* MOBILE: scroll horizontal
                DESKTOP: grid 2 colunas */}
            <div className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {galleryItems.map((workshop, index) => {
                const isActive = index === activeIndex

                const rotations = [
                  '-rotate-2',
                  'rotate-1',
                  '-rotate-1',
                  'rotate-2',
                  '-rotate-[0.5deg]',
                  'rotate-[1.5deg]',
                ]

                return (
                  <button
                    key={workshop.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group relative block aspect-[4/3] w-[66vw] max-w-[260px] shrink-0 snap-center border bg-light p-1.5 text-left shadow-craft-sm transition-all duration-500 sm:w-[42vw] lg:w-auto lg:max-w-none ${rotations[index % rotations.length]} ${
                      isActive
                        ? `z-10 border-carbon opacity-100 shadow-craft lg:scale-[1.04]`
                        : `border-rule opacity-65 hover:z-20 hover:scale-[1.025] hover:rotate-0 hover:opacity-100`
                    } `}
                    aria-label={`Mostrar ${workshop.title}`}
                    aria-pressed={isActive}
                  >
                    <div className="relative h-full w-full overflow-hidden">
                      <img
                        className={`h-full w-full object-cover transition-transform duration-500 ${
                          isActive ? 'scale-[1.02]' : 'group-hover:scale-105'
                        } `}
                        {...responsiveImageProps(
                          workshop.imageUrl!,
                          '(max-width: 1024px) 65vw, 20vw',
                          [320, 480, 640],
                        )}
                        alt=""
                        width="500"
                        height="375"
                        loading="lazy"
                        decoding="async"
                      />

                      <div
                        className={`absolute inset-0 transition-colors duration-300 ${
                          isActive
                            ? 'bg-transparent'
                            : 'bg-carbon/10 group-hover:bg-transparent'
                        } `}
                      />

                      {/* número */}
                      <span className="absolute top-2 left-2 flex h-7 min-w-7 items-center justify-center bg-light/95 px-2 font-mono text-[9px] tracking-wider text-carbon shadow-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* título mobile */}
                      <div className="absolute right-2 bottom-2 left-2 bg-light/95 px-3 py-2 shadow-sm lg:hidden">
                        <span className="block truncate font-display text-sm text-carbon">
                          {workshop.title}
                        </span>
                      </div>
                    </div>

                    {/* fita em algumas miniaturas */}
                    {(index === 1 || index === 4) && (
                      <span
                        className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-3 bg-tape/80 shadow-sm"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Informação complementar desktop */}
            <div className="mt-6 hidden border-t border-dashed border-rule pt-5 lg:block">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-green uppercase">
                {activeWorkshop.category}
              </span>

              <p className="m-0 max-w-sm font-display text-xl leading-relaxed text-pretty text-carbon">
                {activeWorkshop.title}
              </p>
            </div>
          </div>
        </div>

        {/* frase de encerramento */}
        <div className="mt-10 flex items-center gap-4 border-t border-dashed border-rule pt-5">
          <span
            className="h-2 w-2 shrink-0 rotate-45 bg-ochre"
            aria-hidden="true"
          />

          <p className="m-0 font-serif text-base text-muted italic sm:text-lg">
            Cada marca, corte e imperfeição também faz parte da história.
          </p>
        </div>
      </div>
    </section>
  )
}
