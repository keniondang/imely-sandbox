import { useEffect, useState } from 'react'
import { X, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getEntry, type Locale } from '../lib/strings'
import { buildStrSelector } from '../components/Str'

const LOCALES: { id: Locale; label: string }[] = [
  { id: 'id', label: 'ID' },
  { id: 'en', label: 'EN' },
  { id: 'vi', label: 'VI' },
]

// The right-side counterpart to the Inspector's browse/search list — picking
// a key over there shows it here. Kept as its own panel (rather than a
// detail block bolted under the list) so there's room for the original
// string, a real draft-then-Apply workflow, and overflow feedback without
// squeezing the list itself.
export function TranslationPanel() {
  const {
    locale,
    usage,
    overrides,
    applyOverride,
    resetOverride,
    setLivePreview,
    selectedKey,
    selectedOccurrence,
    selectKey,
  } = useApp()

  const [draftText, setDraftText] = useState('')
  const [overflowFlag, setOverflowFlag] = useState<boolean | null>(null)
  const [justApplied, setJustApplied] = useState(false)
  const [copied, setCopied] = useState(false)

  const entry = selectedKey ? getEntry(selectedKey) : null
  const wired = selectedKey ? usage.some((u) => u.key === selectedKey) : false
  const appliedForLocale = selectedKey ? overrides[selectedKey]?.[locale] : undefined

  // Each locale keeps its own draft, so switching the key or the ID/EN/VI
  // pill re-seeds from whatever was already applied for THAT locale (or
  // blank) — and drops any live scratch preview left over from before.
  useEffect(() => {
    setDraftText(appliedForLocale ?? '')
    setJustApplied(false)
    setLivePreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, locale])

  function handleChange(v: string) {
    setDraftText(v)
    setJustApplied(false)
    if (selectedKey) setLivePreview(v ? { key: selectedKey, locale, text: v } : null)
  }

  function handleApply() {
    if (!selectedKey || !draftText.trim()) return
    applyOverride(selectedKey, locale, draftText)
    setLivePreview(null)
    setJustApplied(true)
    setTimeout(() => setJustApplied(false), 1200)
  }

  function handleReset() {
    if (!selectedKey) return
    resetOverride(selectedKey, locale)
    setDraftText('')
    setLivePreview(null)
  }

  function copyKey() {
    if (!selectedKey) return
    navigator.clipboard?.writeText(selectedKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // Overflow check against whatever's actually on screen right now — the
  // live draft while typing (or the applied override, or the real string).
  useEffect(() => {
    if (!selectedKey) {
      setOverflowFlag(null)
      return
    }
    const t = setTimeout(() => {
      const el = document.querySelector(
        buildStrSelector(selectedKey, selectedOccurrence?.screenId, selectedOccurrence?.zone)
      ) as HTMLElement | null
      setOverflowFlag(el ? el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 : null)
    }, 380)
    return () => clearTimeout(t)
  }, [selectedKey, selectedOccurrence, locale, draftText])

  if (!selectedKey || !entry) {
    return (
      <div className="w-[300px] shrink-0 h-full border-l border-imely-line bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-[13px] text-gray-400">
          Pilih string dari daftar di kiri untuk melihat dan menguji terjemahannya di sini.
        </div>
      </div>
    )
  }

  const currentLocaleLabel = LOCALES.find((l) => l.id === locale)?.label ?? locale

  return (
    <div className="w-[300px] shrink-0 h-full border-l border-imely-line bg-white flex flex-col">
      <div className="p-3 border-b border-imely-line flex items-center justify-between">
        <div className="font-bold text-sm text-imely-ink">Terjemahan</div>
        <button
          onClick={() => selectKey(null, null)}
          className="text-gray-400 active:scale-90 transition-transform"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-1 min-w-0">
          <div className="font-mono text-[11px] text-gray-500 break-all flex-1">{entry.key}</div>
          <button
            onClick={copyKey}
            title="Salin key"
            className="text-gray-400 shrink-0 active:scale-90 transition-transform"
          >
            {copied ? <Check size={12} className="text-imely-primary" /> : <Copy size={12} />}
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          {entry.category} {entry.subcategory ? `› ${entry.subcategory}` : ''}
        </div>

        {!wired && (
          <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-md px-2 py-1.5">
            Not wired into a screen in this build yet — locale values only.
          </div>
        )}

        {overflowFlag && wired && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 rounded-md px-2 py-1.5">
            <AlertTriangle size={13} /> Text overflows its container at this length
          </div>
        )}

        <div className="mt-3 text-[11px] font-semibold text-gray-500 uppercase">String asli</div>
        <div className="mt-1.5 space-y-1.5">
          {LOCALES.map((l) => (
            <div
              key={l.id}
              className={`text-[12px] rounded-md px-2 py-1 ${l.id === locale ? 'bg-imely-mint/40' : ''}`}
            >
              <span className="text-gray-400 font-semibold mr-1">{l.label}:</span>
              <span className="text-imely-ink">{entry.locales[l.id]}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
            Draf terjemahan ({currentLocaleLabel})
            {appliedForLocale && (
              <button onClick={handleReset} className="text-gray-400 flex items-center gap-0.5">
                <RotateCcw size={11} /> reset
              </button>
            )}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Ketik draf terjemahan untuk menguji overflow…"
            className="w-full text-[12px] border border-imely-line rounded-lg p-2 outline-none focus:border-imely-primary resize-none"
            rows={4}
          />
          <button
            onClick={handleApply}
            disabled={!draftText.trim()}
            className="mt-2 w-full bg-imely-primary text-white text-[12.5px] font-bold rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform disabled:opacity-40"
          >
            {justApplied ? (
              <>
                <Check size={13} /> Diterapkan
              </>
            ) : (
              'Terapkan'
            )}
          </button>
          {appliedForLocale && !justApplied && (
            <div className="mt-1.5 text-[10.5px] text-gray-400">
              Draf {currentLocaleLabel} yang diterapkan: "{appliedForLocale}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
