import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SkipForward,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getAiSuggestion, getEntry, LOCALE_LABEL, SOURCE_LOCALES } from '../lib/strings'
import { buildStrSelector } from '../components/Str'
import { useBrowseOrder, type BrowseRow } from '../hooks/useBrowseOrder'
import { useNavigateToString } from '../hooks/useNavigateToString'
import { ZONE_TYPE } from '../sandbox/browseConfig'

// The right-side counterpart to the Inspector's browse/search list — picking
// a key over there shows it here. Kept as its own panel (rather than a
// detail block bolted under the list) so there's room for the original
// string, a real draft-then-Save workflow, and overflow feedback without
// squeezing the list itself.
export function TranslationPanel() {
  const {
    targetLocale,
    baseLocale,
    usage,
    overrides,
    applyOverride,
    resetOverride,
    setLivePreview,
    selectedKey,
    selectedOccurrence,
    setFocusPath,
  } = useApp()
  const { rows, pageSections, overlaySections } = useBrowseOrder()
  const navigateTo = useNavigateToString()

  // Keeps the Inspector's drill-down in sync with wherever prev/next lands
  // — opening "other pages" from here should open them in the sidebar too,
  // not just the live preview. A row in a Menu/Popup zone drills the
  // sidebar one level further to match; an "Unused" row (no screenId)
  // drills into its category instead.
  function syncInspectorFocus(row: BrowseRow) {
    if (row.screenId) {
      const zoneType = row.zone ? ZONE_TYPE[row.zone] : undefined
      setFocusPath(zoneType === 'menu' || zoneType === 'popup' ? [row.screenId, zoneType] : [row.screenId])
      return
    }
    const entry = getEntry(row.key)
    setFocusPath(entry ? ['__unwired__', String(entry.category)] : [])
  }

  const [draftText, setDraftText] = useState('')
  const [overflowFlag, setOverflowFlag] = useState<boolean | null>(null)
  const [justApplied, setJustApplied] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grows the translation box to fit its content, so it sits flush
  // against the source column instead of leaving a fixed-height gap for
  // short strings or clipping long ones.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draftText])

  // Where the selected key sits in the same ordered list the Inspector is
  // showing right now — drives prev/next-string, prev/next-overlay (within
  // the current page), and prev/next-page/category.
  const rowIndex = useMemo(() => {
    if (!selectedKey) return -1
    return rows.findIndex(
      (r) =>
        r.key === selectedKey &&
        r.screenId === (selectedOccurrence?.screenId ?? null) &&
        r.zone === (selectedOccurrence?.zone ?? null)
    )
  }, [rows, selectedKey, selectedOccurrence])

  const pageIndex = useMemo(() => {
    if (rowIndex < 0) return -1
    return pageSections.findIndex((s) => rowIndex >= s.startIndex && rowIndex <= s.endIndex)
  }, [pageSections, rowIndex])

  const overlayIndex = useMemo(() => {
    if (rowIndex < 0) return -1
    return overlaySections.findIndex((s) => rowIndex >= s.startIndex && rowIndex <= s.endIndex)
  }, [overlaySections, rowIndex])

  // Overlays sharing the current page, in order — e.g. inside "Gem" that's
  // [Gem itself, Riwayat Gem, Beli MêLy Club / Gem]. A page with no pushed
  // overlays (Beranda, Profil, Notifikasi) only has itself here, so the
  // buttons naturally disable instead of needing a special case.
  const overlaySiblings = useMemo(() => {
    const pageId = pageSections[pageIndex]?.id
    if (pageId === undefined) return []
    return overlaySections.filter((s) => s.pageId === pageId)
  }, [overlaySections, pageSections, pageIndex])
  const overlaySiblingIndex = overlaySiblings.findIndex(
    (s) => s.id === overlaySections[overlayIndex]?.id && s.startIndex === overlaySections[overlayIndex]?.startIndex
  )

  const canPrevRow = rowIndex > 0
  const canNextRow = rowIndex >= 0 && rowIndex < rows.length - 1
  const canPrevOverlay = overlaySiblingIndex > 0
  // Not gated on `overlaySiblingIndex >= 0` — the current row is often in
  // the screen's plain content (index -1, no Menu/Popup group yet), and
  // "next" from there should still be able to step INTO the first group
  // that exists rather than staying stuck because there's no "current"
  // group to count from.
  const canNextOverlay = overlaySiblings.length > 0 && overlaySiblingIndex < overlaySiblings.length - 1
  const canPrevPage = pageIndex > 0
  const canNextPage = pageIndex >= 0 && pageIndex < pageSections.length - 1
  // A "page" is either a real screen or one of the "Unused" category tails
  // appended after them — labeled differently since a category isn't really
  // a page a translator would recognize from the live preview.
  const pageUnitLabel = pageSections[pageIndex]?.id.startsWith('unwired:') ? 'Category' : 'Page'

  function goRow(delta: number) {
    const target = rows[rowIndex + delta]
    if (!target) return
    navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
    syncInspectorFocus(target)
  }

  function goOverlay(delta: number) {
    const target = overlaySiblings[overlaySiblingIndex + delta]
    const targetRow = target ? rows[target.startIndex] : undefined
    if (!targetRow) return
    navigateTo(targetRow.key, targetRow.screenId ?? undefined, targetRow.zone ?? undefined)
    syncInspectorFocus(targetRow)
  }

  function goPage(delta: number) {
    const targetSection = pageSections[pageIndex + delta]
    const targetRow = targetSection ? rows[targetSection.startIndex] : undefined
    if (!targetRow) return
    navigateTo(targetRow.key, targetRow.screenId ?? undefined, targetRow.zone ?? undefined)
    syncInspectorFocus(targetRow)
  }

  // Next string with no translation yet, searching forward from wherever we
  // are and wrapping around — lets a translator resume mid-list without
  // hunting for where they left off.
  function nextUntranslatedRow(): BrowseRow | undefined {
    for (let i = rowIndex + 1; i < rows.length; i++) {
      if (!overrides[rows[i].key]?.[targetLocale]) return rows[i]
    }
    for (let i = 0; i <= rowIndex; i++) {
      if (!overrides[rows[i].key]?.[targetLocale]) return rows[i]
    }
    return undefined
  }

  function goNextUntranslated() {
    const target = nextUntranslatedRow()
    if (!target) return
    navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
    syncInspectorFocus(target)
  }

  const entry = selectedKey ? getEntry(selectedKey) : null
  const wired = selectedKey ? usage.some((u) => u.key === selectedKey) : false
  const savedTranslation = selectedKey ? overrides[selectedKey]?.[targetLocale] : undefined
  // Blank for every key until src/data/aiSuggestions.json is filled in later
  // — see getAiSuggestion in lib/strings.ts. Nothing renders until then.
  const aiSuggestion = selectedKey ? getAiSuggestion(selectedKey, targetLocale) : undefined

  // Each locale keeps its own draft, so switching the key or the target
  // locale re-seeds from whatever was already saved for THAT locale (or
  // blank) — and drops any live scratch preview left over from before.
  useEffect(() => {
    setDraftText(savedTranslation ?? '')
    setJustApplied(false)
    setLivePreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, targetLocale])

  function handleChange(v: string) {
    setDraftText(v)
    setJustApplied(false)
    if (selectedKey) setLivePreview(v ? { key: selectedKey, locale: targetLocale, text: v } : null)
  }

  function handleApply() {
    if (!selectedKey || !draftText.trim()) return
    applyOverride(selectedKey, targetLocale, draftText)
    setLivePreview(null)
    setJustApplied(true)
    setTimeout(() => setJustApplied(false), 1200)
    // Translating into a new language is a long march through ~1,500 keys —
    // auto-advancing to the next gap keeps a translator's hands on the
    // keyboard instead of re-hunting the list after every save.
    const target = nextUntranslatedRow()
    if (target) {
      navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
      syncInspectorFocus(target)
    }
  }

  function handleTextareaKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  function handleReset() {
    if (!selectedKey) return
    resetOverride(selectedKey, targetLocale)
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
  // live draft while typing (or the saved translation, or the real string).
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
  }, [selectedKey, selectedOccurrence, targetLocale, draftText])

  if (!selectedKey || !entry) {
    return (
      <div className="w-[360px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-[13px] text-gray-400">
          Select a string from the list on the left to translate it here.
        </div>
      </div>
    )
  }

  const currentLocaleLabel = LOCALE_LABEL[targetLocale]

  return (
    <div className="w-[360px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col">
      <div className="px-3 py-2 border-b border-imely-line space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => goPage(-1)}
            disabled={!canPrevPage}
            title={`Previous ${pageUnitLabel}`}
            className="flex items-center gap-0.5 text-[10.5px] text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft size={12} /> {pageUnitLabel}
          </button>
          <div
            className="text-[10.5px] text-gray-400 truncate max-w-[130px] text-center"
            title={pageSections[pageIndex]?.label}
          >
            {pageIndex >= 0 ? pageSections[pageIndex]?.label : '—'}
          </div>
          <button
            onClick={() => goPage(1)}
            disabled={!canNextPage}
            title={`Next ${pageUnitLabel}`}
            className="flex items-center gap-0.5 text-[10.5px] text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            {pageUnitLabel} <ChevronsRight size={12} />
          </button>
        </div>
        {/* Always shown, even with nothing to step to — e.g. Beranda has no
            Menu/Popup zones of its own, so both buttons just disable rather
            than the row disappearing, which would look like it's missing. */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => goOverlay(-1)}
            disabled={!canPrevOverlay}
            title="Previous group (Menu/Popup within this screen)"
            className="flex items-center gap-0.5 text-[10.5px] text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={12} /> Group
          </button>
          <div
            className="text-[10.5px] text-gray-400 truncate max-w-[110px] text-center"
            title={overlaySections[overlayIndex]?.label}
          >
            {overlayIndex >= 0 ? overlaySections[overlayIndex]?.label : '—'}
          </div>
          <button
            onClick={() => goOverlay(1)}
            disabled={!canNextOverlay}
            title="Next group (Menu/Popup within this screen)"
            className="flex items-center gap-0.5 text-[10.5px] text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Group <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => goRow(-1)}
            disabled={!canPrevRow}
            title="Previous string"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-imely-ink px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <div className="text-[10.5px] text-gray-400 shrink-0">
            {rowIndex >= 0 ? `${rowIndex + 1} / ${rows.length}` : '—'}
          </div>
          <button
            onClick={() => goRow(1)}
            disabled={!canNextRow}
            title="Next string"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-imely-ink px-2 py-1 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
        <button
          onClick={goNextUntranslated}
          title="Jump to the next string with no translation yet"
          className="w-full flex items-center justify-center gap-1 text-[10.5px] font-semibold text-imely-primary px-2 py-1 rounded-md hover:bg-imely-mint/30 active:scale-[0.98] transition-transform"
        >
          <SkipForward size={11} /> Skip to next untranslated
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-1 min-w-0">
          <div className="font-mono text-[11px] text-gray-500 break-all flex-1">{entry.key}</div>
          <button
            onClick={copyKey}
            title="Copy key"
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

        {/* CAT-tool-style side-by-side comparison — the chosen base language
            directly beside the translation box, instead of both stacked
            under a shared "Original string" heading with a scroll between
            them. */}
        <div className="mt-3 rounded-xl border border-imely-line overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-imely-line">
            <div className="p-2.5 bg-gray-50/70">
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                {LOCALE_LABEL[baseLocale]} · source
              </div>
              <div className="text-[13.5px] text-imely-ink leading-snug">
                {entry.locales[baseLocale] || entry.locales.en || entry.locales.id}
              </div>
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-imely-primary uppercase">
                  {currentLocaleLabel} · translation
                </span>
                {savedTranslation && (
                  <button
                    onClick={handleReset}
                    title="Clear this translation"
                    className="text-gray-400 hover:text-imely-primary"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
              </div>
              {aiSuggestion ? (
                <button
                  onClick={() => handleChange(aiSuggestion)}
                  className="mb-1.5 w-full text-left text-[10.5px] bg-imely-mint/30 hover:bg-imely-mint/50 rounded-md px-1.5 py-1 flex items-start gap-1 text-imely-ink transition-colors"
                >
                  <Sparkles size={10} className="text-imely-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{aiSuggestion}</span>
                </button>
              ) : (
                <div className="mb-1.5 text-[10px] text-gray-300 italic">No AI suggestion yet</div>
              )}
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={`Type the ${currentLocaleLabel} translation…`}
                className="w-full text-[13.5px] text-imely-ink outline-none resize-none overflow-hidden bg-transparent placeholder:text-gray-300"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Other 2 source languages — still available, just de-emphasized
            since the base-language column above covers the primary case. */}
        <div className="mt-2 space-y-1 px-0.5">
          {SOURCE_LOCALES.filter((l) => l !== baseLocale).map((l) => (
            <div key={l} className="flex items-baseline gap-1.5 text-[10.5px] text-gray-400">
              <span className="font-semibold text-gray-500 shrink-0">{LOCALE_LABEL[l]}:</span>
              <span className="truncate">{entry.locales[l]}</span>
            </div>
          ))}
        </div>

        {draftText.trim() && draftText !== (savedTranslation ?? '') && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Unsaved changes
          </div>
        )}
        <div className="mt-2 text-[10px] text-gray-300">Ctrl/Cmd + Enter to save</div>
        <button
          onClick={handleApply}
          disabled={!draftText.trim()}
          className="mt-1 w-full bg-imely-primary text-white text-[12.5px] font-bold rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform disabled:opacity-40"
        >
          {justApplied ? (
            <>
              <Check size={13} /> Saved
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}
