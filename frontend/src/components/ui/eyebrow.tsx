import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type EyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  dot?: boolean
}

export function Eyebrow({ className, dot = false, children, ...props }: EyebrowProps) {
  return (
    <span className={cn('mb-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green', className)} {...props}>
      {dot && <i className="size-2 rounded-full bg-ochre" aria-hidden="true" />}
      {children}
    </span>
  )
}
