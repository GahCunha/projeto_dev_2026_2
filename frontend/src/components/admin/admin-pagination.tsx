type AdminPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, totalItems, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="mt-5 flex items-center justify-between gap-4" aria-label="Paginação das inscrições">
      <p className="hidden text-sm text-muted sm:block">{totalItems} inscrições no total</p>
      <div className="ml-auto flex items-center gap-3">
        <button className="min-h-10 border border-rule bg-paper px-4 text-sm font-bold text-carbon transition hover:border-carbon disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
        <span className="font-mono text-xs text-muted" aria-live="polite">{page} / {totalPages}</span>
        <button className="min-h-10 border border-rule bg-paper px-4 text-sm font-bold text-carbon transition hover:border-carbon disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Próxima</button>
      </div>
    </nav>
  )
}
