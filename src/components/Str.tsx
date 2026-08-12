import { useEffect, type ElementType } from 'react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { useScreenScope, useZoneScope } from '../context/ScreenScope'
import { resolveString } from '../lib/strings'

interface StrProps {
  k: string // string key from strings.json
  vars?: Record<string, string | number>
  as?: ElementType
  className?: string
}

// The same key can legitimately render more than once on a screen (e.g. a gem
// total shown both on the page and inside a detail popup), so data-str-key
// alone doesn't uniquely address an element — pair it with screen + zone.
export function buildStrSelector(key: string, screenId?: ScreenId | null, zone?: Zone | null): string {
  let sel = `[data-str-key="${CSS.escape(key)}"]`
  if (screenId) sel += `[data-str-screen="${CSS.escape(screenId)}"]`
  if (zone) sel += `[data-str-zone="${CSS.escape(zone)}"]`
  return sel
}

// Renders a localized string by key AND registers where it lives so the
// sandbox Inspector can jump the live preview straight to it.
// Highlighting itself is handled centrally by useStringHighlighter, keyed
// off the data-str-key/-screen/-zone attributes below — Str doesn't manage
// its own highlight state, so there's exactly one source of truth for
// "what's lit up right now" (see hooks/useStringHighlighter.ts).
export function Str({ k, vars, as: Tag = 'span', className }: StrProps) {
  const { locale, overrides, registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    registerUsage({ key: k, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId, zone])

  const text = overrides[k] ?? resolveString(k, locale, vars)

  return (
    <Tag data-str-key={k} data-str-screen={screenId} data-str-zone={zone} className={className}>
      {text}
    </Tag>
  )
}
