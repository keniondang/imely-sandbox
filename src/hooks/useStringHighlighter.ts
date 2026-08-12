import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { buildStrSelector } from '../components/Str'

const HIGHLIGHT_MS = 2000

export function useStringHighlighter() {
  const { focusKey, focusScreenId, focusZone, focusToken } = useApp()

  useEffect(() => {
    if (!focusKey) return

    // Clear every previously-highlighted element first — this is the fix:
    // before, each <Str> managed its own highlight + timeout independently,
    // so pressing a new key before the old 2s timeout fired left both lit.
    document
      .querySelectorAll('[data-str-highlighted="true"]')
      .forEach((el) => el.removeAttribute('data-str-highlighted'))

    // A jump can also fire a popupRequest (see usePopupRequest) that opens a
    // menu/modal in a follow-up render — give that a tick to land in the DOM
    // before searching for the target element, or a same-click jump into a
    // popup finds nothing and silently no-ops.
    const find = setTimeout(() => {
      // Qualified by screen + zone too — the same key can render more than
      // once on a screen (e.g. a total shown on the page AND inside a popup),
      // and an unqualified lookup always lands on whichever copy is first in
      // the DOM regardless of which occurrence was actually requested.
      const el = document.querySelector<HTMLElement>(buildStrSelector(focusKey, focusScreenId, focusZone))
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.setAttribute('data-str-highlighted', 'true')
      setTimeout(() => el.removeAttribute('data-str-highlighted'), HIGHLIGHT_MS)
    }, 60)

    return () => clearTimeout(find)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken])
}
