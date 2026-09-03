import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

const shortcuts = [
  { title: 'Inscrições', description: 'Consulte participantes, confirme vagas e acompanhe o status de cada pessoa.', to: '/admin/inscricoes', action: 'Ver inscrições' },
  { title: 'Oficinas', description: 'Publique novas experiências e mantenha datas, vagas e materiais atualizados.', to: '/admin/oficinas', action: 'Gerenciar oficinas' },
]

export function AdminHomePage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 border-b border-rule pb-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Visão geral</p>
        <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">Olá, {firstName}.</h1>
        <p className="mt-2 text-muted">Sua bancada está pronta. Por onde começamos hoje?</p>
      </div>
      <section aria-labelledby="atalhos-title">
        <h2 className="mb-4 font-display text-xl font-bold text-carbon" id="atalhos-title">Acessos rápidos</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {shortcuts.map((shortcut, index) => (
            <article className="group border border-rule bg-paper p-6 shadow-craft-sm transition hover:-translate-y-1 hover:shadow-craft" key={shortcut.title}>
              <span className="mb-8 block font-mono text-xs text-ochre">0{index + 1}</span>
              <h3 className="font-display text-2xl font-bold text-carbon">{shortcut.title}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-muted">{shortcut.description}</p>
              <Link className="mt-6 inline-block font-mono text-xs font-bold uppercase tracking-wider text-blue underline decoration-saffron decoration-2 underline-offset-4" to={shortcut.to}>{shortcut.action} →</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
