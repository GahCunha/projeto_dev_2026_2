import { BrandMark } from '../brand-mark'

const navLink = 'font-mono text-xs uppercase tracking-widest text-carbon no-underline hover:text-blue'

export function SiteHeader() {
  return (
    <>
      <a className="fixed top-2 left-2 z-30 -translate-y-20 bg-carbon px-4 py-3 text-light transition-transform focus:translate-y-0" href="#conteudo">Pular para o conteúdo</a>
      <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between border-b border-rule bg-light/95 px-5 backdrop-blur-md sm:px-8 lg:px-16 2xl:px-24 max-sm:min-h-16">
      <a className="flex items-center gap-3 font-display text-xl font-bold text-carbon no-underline sm:text-2xl" href="#inicio" aria-label="Feito à Mão — início">
        <BrandMark />
        <span>Feito à Mão</span>
      </a>
      <nav className="flex gap-4 md:gap-10" aria-label="Navegação principal">
        <a className={navLink} href="#oficinas">Oficinas</a>
        <a className={`${navLink} max-sm:hidden`} href="#como-funciona">Como funciona</a>
      </nav>
      </header>
    </>
  )
}
