export function WorkshopStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border bg-paper px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase ${active ? 'border-success text-success' : 'border-muted text-muted'}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}
