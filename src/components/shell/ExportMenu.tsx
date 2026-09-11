import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { exportPairedXlsx, exportSingleLocaleXlsx, type ExportRowFilter } from '../../lib/exportXlsx'
import { LOCALE_LABEL, SOURCE_LOCALES, TARGET_LOCALES, type SourceLocale, type TargetLocale } from '../../lib/strings'
import type { Locale } from '../../lib/strings'

const ROW_FILTERS: { id: ExportRowFilter; label: string }[] = [
  { id: 'all', label: 'All rows' },
  { id: 'untranslated', label: 'Untranslated only' },
  { id: 'translated', label: 'Translated only' },
]

// Two tiers: the handoff format a translator actually works from (their
// target language's column paired with whichever base language is
// currently selected as reference, filterable to just what's left to do),
// and — tucked behind a toggle since it's a rarer need — a bare single-
// column dump of one language on its own with no pairing.
export function ExportMenu({
  overrides,
  baseLocale,
  targetLocale,
  triggerClassName,
}: {
  overrides: Record<string, Partial<Record<TargetLocale, string>>>
  baseLocale: SourceLocale
  targetLocale: TargetLocale
  triggerClassName: string
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<ExportRowFilter>('all')
  const [showSingleColumn, setShowSingleColumn] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function handlePaired(target: TargetLocale) {
    exportPairedXlsx(overrides, baseLocale, target, filter)
    setOpen(false)
  }

  function handleSingle(locale: Locale) {
    exportSingleLocaleXlsx(overrides, locale)
    setOpen(false)
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Download strings as .xlsx"
        className={triggerClassName}
      >
        <Download size={13} /> Export .xlsx
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface rounded-lg shadow-lg border border-line py-1.5 z-50">
          <div className="px-3 pb-1 text-[10px] font-semibold text-muted uppercase tracking-wide">
            For translation — {LOCALE_LABEL[baseLocale]} reference + target column
          </div>
          <div className="px-3 pb-1.5 flex items-center gap-1 flex-wrap">
            {ROW_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${
                  filter === f.id
                    ? 'bg-imely-primary text-white border-imely-primary'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {TARGET_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => handlePaired(l)}
              className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
            >
              {LOCALE_LABEL[baseLocale]} → {LOCALE_LABEL[l]}
              {l === targetLocale && <span className="text-muted"> (current target)</span>}
            </button>
          ))}

          <button
            onClick={() => setShowSingleColumn((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 mt-1 text-[10px] font-semibold text-muted uppercase tracking-wide border-t border-line hover:text-ink"
          >
            Single column only (no pairing)
            <ChevronDown size={12} className={`transition-transform ${showSingleColumn ? 'rotate-180' : ''}`} />
          </button>
          {showSingleColumn && (
            <div className="pb-1">
              <div className="px-3 pt-1 text-[9.5px] font-semibold text-muted/70 uppercase">Source</div>
              {SOURCE_LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => handleSingle(l)}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                >
                  {LOCALE_LABEL[l]} only
                </button>
              ))}
              <div className="px-3 pt-1 text-[9.5px] font-semibold text-muted/70 uppercase">Target</div>
              {TARGET_LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => handleSingle(l)}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                >
                  {LOCALE_LABEL[l]} only
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
