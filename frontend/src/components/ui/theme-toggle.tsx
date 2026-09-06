import { useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const themeStorageKey = 'feito-a-mao-theme'

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(themeStorageKey)

  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isDark = theme === 'dark'

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [isDark, theme])

  return (
    <button
      className="grid size-11 shrink-0 place-items-center rounded-full border border-rule bg-paper text-lg text-carbon transition hover:-translate-y-0.5 hover:border-carbon hover:shadow-craft-sm"
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
      title={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
    >
      <span aria-hidden="true">{isDark ? '☀' : '◐'}</span>
    </button>
  )
}
