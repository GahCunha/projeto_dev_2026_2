import { pagePadding } from '../../lib/styles'
import { BrandMark } from '../brand-mark'

export function SiteFooter() {
  return (
    <footer className={`flex items-center justify-between gap-8 bg-light py-10 text-carbon ${pagePadding} max-sm:flex-col max-sm:items-start`}>
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <BrandMark />
        <div>
          <strong className="font-display text-xl">Feito à Mão</strong>
          <p className="m-0 text-muted">A inteligência das mãos e a alma dos materiais.</p>
        </div>
      </div>
      <span className="text-muted">Oficinas para aprender fazendo.</span>
    </footer>
  )
}
