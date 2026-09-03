import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-4 rounded-sm border px-5 py-3 font-mono text-xs uppercase tracking-wider no-underline transition duration-200 disabled:cursor-wait disabled:opacity-65 disabled:transform-none disabled:shadow-none',
  {
    variants: {
      variant: {
        primary: 'border-ink bg-saffron text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-button',
        outline: 'border-ink bg-transparent text-carbon hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-button',
        ghost: 'min-h-0 border-transparent bg-transparent p-0 font-sans font-bold normal-case tracking-normal text-blue',
      },
      size: {
        default: '',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)
