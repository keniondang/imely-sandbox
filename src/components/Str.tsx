import { useEffect, type ElementType } from 'react'
import { useApp } from '../context/AppContext'
import { useScreenScope } from '../context/ScreenScope'
import { resolveString } from '../lib/strings'

interface StrProps {
  k: string // string key from strings.json
  vars?: Record<string, string | number>
  as?: ElementType
  className?: string
}

// Renders a localized string by key AND registers where it lives so the
// sandbox Inspector can jump the live preview straight to it.
// Highlighting itself is handled centrally by useStringHighlighter, keyed
// off the data-str-key attribute below — Str doesn't manage its own
// highlight state, so there's exactly one source of truth for "what's lit
// up right now" (see hooks/useStringHighlighter.ts).
export function Str({ k, vars, as: Tag = 'span', className }: StrProps) {
  const { locale, overrides, registerUsage } = useApp()
  const screenId = useScreenScope()

  useEffect(() => {
    registerUsage({ key: k, screenId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, screenId])

  const text = overrides[k] ?? resolveString(k, locale, vars)

  return (
    <Tag data-str-key={k} className={className}>
      {text}
    </Tag>
  )
}
