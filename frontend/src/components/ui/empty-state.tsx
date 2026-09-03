import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type EmptyStateProps = {
  title: string
  description?: string
  mark?: ReactNode
  action?: ReactNode
  role?: 'alert' | 'status'
  className?: string
}

export function EmptyState({ title, description, mark, action, role, className }: EmptyStateProps) {
  return (
    <div className={cn('border border-dashed border-rule px-6 py-12 text-center lg:py-16', className)} role={role}>
      {mark && <span className="mb-4 block text-2xl text-blue">{mark}</span>}
      <h3 className="mb-2 font-display text-2xl text-carbon">{title}</h3>
      {description && <p className="mx-auto mb-6 max-w-lg text-muted">{description}</p>}
      {action}
    </div>
  )
}
