import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { buildStrSelector } from '../components/Str'

// Keeps exactly one element highlighted: whichever key is currently selected
// (i.e. showing in Translation Mode). Tied to selection rather than a
// fire-and-forget timeout, so the marker stays lit the whole time the
// translator is working that key — clicking Apply/reset, switching locale,
// etc. — and only clears when a different key is picked.
export function useStringHighlighter() {
  const { selectedKey, selectedOccurrence, setToastPreview, setUnwiredAlertKey } = useApp()

  useEffect(() => {
    document
      .querySelectorAll('[data-str-highlighted="true"]')
      .forEach((el) => el.removeAttribute('data-str-highlighted'))
    setToastPreview(null)
    setUnwiredAlertKey(null)

    if (!selectedKey) return

    // No known screen/zone at all — nothing registered this key anywhere,
    // so there's no live preview to jump to and no toast to fall back on
    // either (that needs a screen/zone to place it in). Surface a warning
    // in the preview instead of leaving the click looking like it did
    // nothing.
    if (!selectedOccurrence) {
      setUnwiredAlertKey(selectedKey)
      return
    }

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
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.setAttribute('data-str-highlighted', 'true')
        return
      }

      // No DOM element anywhere for this key — it's a toast-only string
      // (registered via useRegisterKeys, see Str.tsx) rather than something
      // a <Str>/<RichStr> renders, so there's nothing to outline. Surface it
      // as a toast bubble instead (see App.tsx). selectedOccurrence is
      // guaranteed set here — the no-occurrence case already returned above.
      setToastPreview({ key: selectedKey, screenId: selectedOccurrence.screenId, zone: selectedOccurrence.zone })
    }, 60)

    return () => clearTimeout(find)
  }, [selectedKey, selectedOccurrence, setToastPreview, setUnwiredAlertKey])
}
