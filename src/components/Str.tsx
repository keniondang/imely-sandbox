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
  const { locale, overrides, livePreview, registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    registerUsage({ key: k, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId, zone])

  // Live preview (still typing, not yet applied) wins over an applied
  // override, which wins over the real locale text — both are scoped to the
  // currently selected locale, same as the applied override.
  const liveText = livePreview && livePreview.key === k && livePreview.locale === locale ? livePreview.text : undefined
  const text = liveText ?? overrides[k]?.[locale] ?? resolveString(k, locale, vars)

  return (
    <Tag data-str-key={k} data-str-screen={screenId} data-str-zone={zone} className={className}>
      {text}
    </Tag>
  )
}

// A handful of xlsx values carry basic inline HTML (<b>, <a href>...) meant
// for a real HTML-rendering view — plain Str would show the literal tags.
// RichStr resolves the same way but bolds <b> spans and unwraps <a> to their
// inner text, so the exact xlsx wording still renders (just legible) instead
// of being replaced with hand-typed text.
export function RichStr({ k, vars, className }: StrProps) {
  const { locale, overrides, livePreview, registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    registerUsage({ key: k, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId, zone])

  const liveText = livePreview && livePreview.key === k && livePreview.locale === locale ? livePreview.text : undefined
  const raw = liveText ?? overrides[k]?.[locale] ?? resolveString(k, locale, vars)
  const stripped = raw.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
  const parts = stripped.split(/(<b>.*?<\/b>)/gi).filter(Boolean)

  return (
    <span data-str-key={k} data-str-screen={screenId} data-str-zone={zone} className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^<b>(.*?)<\/b>$/i)
        return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{part}</span>
      })}
    </span>
  )
}
