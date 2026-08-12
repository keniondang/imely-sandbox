import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

const HIGHLIGHT_MS = 2000

export function useStringHighlighter() {
  const { focusKey, focusToken } = useApp()

  useEffect(() => {
    if (!focusKey) return

    // Clear every previously-highlighted element first — this is the fix:
    // before, each <Str> managed its own highlight + timeout independently,
    // so pressing a new key before the old 2s timeout fired left both lit.
    document
      .querySelectorAll('[data-str-highlighted="true"]')
      .forEach((el) => el.removeAttribute('data-str-highlighted'))

    const el = document.querySelector<HTMLElement>(
      `[data-str-key="${CSS.escape(focusKey)}"]`
    )
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.setAttribute('data-str-highlighted', 'true')

    const t = setTimeout(() => el.removeAttribute('data-str-highlighted'), HIGHLIGHT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken])
}
