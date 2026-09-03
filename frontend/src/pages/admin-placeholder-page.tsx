type AdminPlaceholderPageProps = { section: string }

export function AdminPlaceholderPage({ section }: AdminPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-ochre">Em construção</p>
      <h1 className="font-display text-3xl font-bold text-carbon sm:text-4xl">{section}</h1>
      <div className="mt-8 border border-dashed border-rule bg-paper p-8 text-center sm:p-12">
        <p className="font-display text-xl font-bold text-carbon">A estrutura está pronta para o próximo incremento.</p>
        <p className="mx-auto mt-2 max-w-lg leading-relaxed text-muted">Aqui entraremos com os dados reais da API, seus estados de carregamento e as ações administrativas.</p>
      </div>
    </div>
  )
}
