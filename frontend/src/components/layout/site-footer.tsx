import { pagePadding } from '../../lib/styles'
import { BrandMark } from '../brand-mark'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`relative overflow-hidden border-t border-rule bg-light text-carbon ${pagePadding} `}
    >
      {/* Linha decorativa / fio */}
      <div
        className="pointer-events-none absolute top-20 -right-20 h-32 w-[45%] -rotate-3 rounded-[50%] border-t-2 border-dashed border-blue/35 max-md:hidden"
        aria-hidden="true"
      />

      {/* Área principal */}
      <div className="relative mx-auto max-w-7xl py-12 sm:py-14 lg:py-16">
        {/* Chamada final */}
        <div className="relative mb-12 grid gap-7 border-b border-rule pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="mb-3 block font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              Antes de ir
            </span>

            <h2 className="m-0 max-w-3xl font-display text-3xl leading-[1.08] -tracking-wide text-balance text-carbon sm:text-4xl md:text-5xl lg:text-6xl">
              Talvez esteja na hora de fazer alguma coisa{' '}
              <em className="font-serif font-normal text-ochre italic">
                com as próprias mãos.
              </em>
            </h2>
          </div>

          <a
            href="#oficinas"
            className="group inline-flex w-fit items-center gap-3 border border-carbon bg-carbon px-5 py-3 font-mono text-xs tracking-[0.12em] text-light uppercase transition-all duration-300 hover:-translate-y-1 hover:bg-ochre hover:text-carbon hover:shadow-craft-sm"
          >
            Ver oficinas
            <span
              className="text-base transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>

        {/* Conteúdo do footer */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_1fr] lg:gap-14">
          {/* Marca */}
          <div className="max-w-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="transition-transform duration-500 hover:scale-105 hover:-rotate-6">
                <BrandMark />
              </div>

              <div>
                <strong className="block font-display text-2xl leading-none text-carbon">
                  Feito à Mão
                </strong>

                <span className="mt-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">
                  Oficinas & encontros
                </span>
              </div>
            </div>

            <p className="m-0 max-w-sm leading-relaxed text-pretty text-muted">
              A inteligência das mãos, a alma dos materiais e o prazer de
              aprender fazendo.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Navegação do rodapé">
            <span className="mb-4 block font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
              Explore
            </span>

            <div className="flex flex-col items-start gap-3">
              <FooterLink href="#inicio">Início</FooterLink>

              <FooterLink href="#oficinas">Oficinas</FooterLink>

              <FooterLink href="#depoimentos">Histórias</FooterLink>
            </div>
          </nav>

          {/* Manifesto */}
          <div>
            <span className="mb-4 block font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
              Nosso lembrete
            </span>

            <blockquote className="m-0 border-l-2 border-ochre pl-4 font-display text-xl leading-relaxed text-carbon">
              “Nem tudo precisa ser rápido. Algumas coisas precisam ser{' '}
              <span className="font-serif text-ochre italic">feitas.</span>”
            </blockquote>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="mt-12 flex gap-5 border-t border-dashed border-rule pt-6 max-sm:flex-col sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            <span>© {currentYear} Feito à Mão</span>

            <span className="hidden text-ochre sm:inline" aria-hidden="true">
              ✦
            </span>

            <span>Oficinas para aprender fazendo</span>
          </div>

          <a
            href="#inicio"
            className="group inline-flex w-fit items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-carbon"
          >
            Voltar ao topo
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rule text-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-carbon group-hover:bg-carbon group-hover:text-light"
              aria-hidden="true"
            >
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="group relative font-display text-lg text-carbon transition-colors hover:text-ochre"
    >
      {children}

      <span
        className="absolute -bottom-1 left-0 h-px w-0 bg-ochre transition-all duration-300 group-hover:w-full"
        aria-hidden="true"
      />
    </a>
  )
}
