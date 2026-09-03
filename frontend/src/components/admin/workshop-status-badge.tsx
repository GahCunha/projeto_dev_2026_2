export function WorkshopStatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${active ? 'border-success/25 bg-success/10 text-success' : 'border-muted/25 bg-deep text-muted'}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}
