import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { buildStrSelector } from '../components/Str'

// Keeps exactly one element highlighted: whichever key is currently selected
// (i.e. showing in the right-side TranslationPanel). Tied to selection rather
// than a fire-and-forget timeout, so the marker stays lit the whole time the
// translator is working that key in the panel — clicking Terapkan/reset,
// switching locale, etc. — and only clears when a different key is picked or
// the panel is closed.
export function useStringHighlighter() {
  const { selectedKey, selectedOccurrence } = useApp()

  useEffect(() => {
    document
      .querySelectorAll('[data-str-highlighted="true"]')
      .forEach((el) => el.removeAttribute('data-str-highlighted'))

    if (!selectedKey) return

    // A jump can also fire a popupRequest (see usePopupRequest) that opens a
    // menu/modal in a follow-up render — give that a tick to land in the DOM
    // before searching for the target element, or a same-click jump into a
    // popup finds nothing and silently no-ops.
    const find = setTimeout(() => {
      // Qualified by screen + zone too — the same key can render more than
      // once on a screen (e.g. a total shown on the page AND inside a popup),
      // and an unqualified lookup always lands on whichever copy is first in
      // the DOM regardless of which occurrence was actually selected.
      const el = document.querySelector<HTMLElement>(
        buildStrSelector(selectedKey, selectedOccurrence?.screenId, selectedOccurrence?.zone)
      )
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.setAttribute('data-str-highlighted', 'true')
    }, 60)

    return () => clearTimeout(find)
  }, [selectedKey, selectedOccurrence])
}
