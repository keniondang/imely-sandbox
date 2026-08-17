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

// For text that reaches the screen via resolveString() instead of <Str>/
// <RichStr> — toast messages and input placeholder attributes, both of
// which are genuinely shown to the user but can't be JSX children — so the
// Inspector's "wired" tracking (driven entirely by Str/RichStr's own mount
// effect) would otherwise never see them and misreport them as unused.
// Call with the fixed list of keys a component resolves this way.
export function useRegisterKeys(keys: string[]) {
  const { registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    for (const key of keys) registerUsage({ key, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join('|'), screenId, zone])
}

// Renders a localized string by key AND registers where it lives so the
// sandbox Inspector can jump the live preview straight to it.
// Highlighting itself is handled centrally by useStringHighlighter, keyed
// off the data-str-key/-screen/-zone attributes below — Str doesn't manage
// its own highlight state, so there's exactly one source of truth for
// "what's lit up right now" (see hooks/useStringHighlighter.ts).
export function Str({ k, vars, as: Tag = 'span', className }: StrProps) {
  const { targetLocale, baseLocale, overrides, livePreview, registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    registerUsage({ key: k, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId, zone])

  // Live preview (still typing, not yet applied) wins over an applied
  // target-locale translation, which wins over the chosen base language's
  // sheet text — so anything not yet translated still shows something,
  // in whichever source language the translator picked as their reference.
  const liveText =
    livePreview && livePreview.key === k && livePreview.locale === targetLocale ? livePreview.text : undefined
  const text = liveText ?? overrides[k]?.[targetLocale] ?? resolveString(k, baseLocale, vars)

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
  const { targetLocale, baseLocale, overrides, livePreview, registerUsage } = useApp()
  const screenId = useScreenScope()
  const zone = useZoneScope()

  useEffect(() => {
    registerUsage({ key: k, screenId, zone })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId, zone])

  const liveText =
    livePreview && livePreview.key === k && livePreview.locale === targetLocale ? livePreview.text : undefined
  const raw = liveText ?? overrides[k]?.[targetLocale] ?? resolveString(k, baseLocale, vars)
  const stripped = raw.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
  // <font color="..."> wraps a highlighted run (e.g. the "MêLy Club" callout).
  // The sheet's color value is sometimes a real hex code and sometimes an
  // app design-system token (not valid CSS) — hex gets an inline style, a
  // token falls back to the imely-primary accent class since that's what
  // these callouts consistently mean in this app.
  const parts = stripped.split(/(<font[^>]*>.*?<\/font>|<b>.*?<\/b>)/gi).filter(Boolean)

  return (
    <span data-str-key={k} data-str-screen={screenId} data-str-zone={zone} className={className}>
      {parts.map((part, i) => {
        const fontMatch = part.match(/^<font([^>]*)>(.*)<\/font>$/i)
        if (fontMatch) {
          const [, attrs, inner] = fontMatch
          // Sheet data sometimes double-quotes the attribute value
          // (color=""token"" from an import escaping artifact), so strip
          // any run of quote characters on either side rather than
          // assuming exactly one pair.
          const colorMatch = attrs.match(/color=["']*([^"'>]*)["']*/i)
          const color = colorMatch ? colorMatch[1] : ''
          const boldMatch = inner.match(/^<b>(.*)<\/b>$/i)
          const content = boldMatch ? boldMatch[1] : inner
          const style = color.startsWith('#') ? { color } : undefined
          const colorClass = color.startsWith('#') ? '' : 'text-imely-primary'
          return boldMatch ? (
            <strong key={i} style={style} className={colorClass}>
              {content}
            </strong>
          ) : (
            <span key={i} style={style} className={colorClass}>
              {content}
            </span>
          )
        }
        const m = part.match(/^<b>(.*?)<\/b>$/i)
        return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{part}</span>
      })}
    </span>
  )
}
