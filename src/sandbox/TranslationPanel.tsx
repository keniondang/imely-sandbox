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
import {
  getAiSuggestion,
  getEntry,
  isTargetLocale,
  LOCALE_LABEL,
  SOURCE_LOCALES,
  type SourceLocale,
} from '../lib/strings'
import { buildStrSelector } from '../components/Str'
import { useBrowseOrder, type BrowseRow } from '../hooks/useBrowseOrder'
import { useNavigateToString } from '../hooks/useNavigateToString'
import { ZONE_TYPE } from '../sandbox/browseConfig'

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

  // Next string with no override for the ACTIVE locale, searching forward
  // from wherever we are and wrapping around — lets a translator resume mid-
  // list without hunting for where they left off. Only meaningful for target
  // locales (source locales don't have a "done" concept).
  function nextUntranslatedRow(): BrowseRow | undefined {
    for (let i = rowIndex + 1; i < rows.length; i++) {
      if (!overrides[rows[i].key]?.[locale]) return rows[i]
    }
    for (let i = 0; i <= rowIndex; i++) {
      if (!overrides[rows[i].key]?.[locale]) return rows[i]
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
  const appliedForLocale = selectedKey ? overrides[selectedKey]?.[locale] : undefined
  // Blank for every key until src/data/aiSuggestions.json is filled in later
  // — see getAiSuggestion in lib/strings.ts. Nothing renders until then.
  const aiSuggestion = selectedKey ? getAiSuggestion(selectedKey, locale) : undefined

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
    // Translating into a new language is a long march through ~1,500 keys —
    // auto-advancing to the next gap keeps a translator's hands on the
    // keyboard instead of re-hunting the list after every save. Source
    // locales stay put since "Apply" there is a one-off wording test, not a
    // step in a checklist.
    if (isTargetLocale(locale)) {
      const target = nextUntranslatedRow()
      if (target) {
        navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
        syncInspectorFocus(target)
      }
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
      <div className="w-[300px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-[13px] text-gray-400">
          {isTargetLocale(locale)
            ? 'Select a string from the list on the left to translate it here.'
            : 'Select a string from the list on the left to view and test its translation here.'}
        </div>
      </div>
    )
  }

  const targetMode = isTargetLocale(locale)
  const currentLocaleLabel = LOCALE_LABEL[locale]

  return (
    <div className="w-[300px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col">
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
        {targetMode && (
          <button
            onClick={goNextUntranslated}
            title="Jump to the next string with no translation yet"
            className="w-full flex items-center justify-center gap-1 text-[10.5px] font-semibold text-imely-primary px-2 py-1 rounded-md hover:bg-imely-mint/30 active:scale-[0.98] transition-transform"
          >
            <SkipForward size={11} /> Skip to next untranslated
          </button>
        )}
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

        <div className="mt-3 text-[11px] font-semibold text-gray-500 uppercase">Original string</div>
        <div className="text-[10px] text-gray-400 -mt-0.5 mb-1">Click any line to fix the source text itself.</div>
        <div className="space-y-1.5">
          {SOURCE_LOCALES.map((l) => (
            <SourceStringRow
              key={l}
              srcLocale={l}
              entryKey={selectedKey}
              original={entry.locales[l] ?? ''}
              overrideText={overrides[selectedKey]?.[l]}
              isActiveLocale={l === locale}
              onSave={(text) => applyOverride(selectedKey, l, text)}
              onReset={() => resetOverride(selectedKey, l)}
            />
          ))}
        </div>

        {targetMode && (
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-imely-primary" /> AI suggestion
              </span>
              {aiSuggestion && (
                <button onClick={() => handleChange(aiSuggestion)} className="text-imely-primary font-semibold">
                  Use this
                </button>
              )}
            </div>
            {aiSuggestion ? (
              <div className="text-[12px] bg-imely-mint/30 rounded-md px-2 py-1.5 text-imely-ink">{aiSuggestion}</div>
            ) : (
              <div className="text-[12px] text-gray-300 italic rounded-md px-2 py-1.5 border border-dashed border-imely-line">
                No suggestion yet
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
            {targetMode ? 'Translation' : 'Draft translation'} ({currentLocaleLabel})
            {appliedForLocale && (
              <button onClick={handleReset} className="text-gray-400 flex items-center gap-0.5">
                <RotateCcw size={11} /> {targetMode ? 'clear' : 'reset'}
              </button>
            )}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={targetMode ? `Type the ${currentLocaleLabel} translation…` : 'Type a draft translation to test overflow…'}
            className="w-full text-[12px] border border-imely-line rounded-lg p-2 outline-none focus:border-imely-primary resize-none"
            rows={4}
          />
          <div className="mt-1 text-[10px] text-gray-300">Ctrl/Cmd + Enter to {targetMode ? 'save' : 'apply'}</div>
          <button
            onClick={handleApply}
            disabled={!draftText.trim()}
            className="mt-1 w-full bg-imely-primary text-white text-[12.5px] font-bold rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform disabled:opacity-40"
          >
            {justApplied ? (
              <>
                <Check size={13} /> {targetMode ? 'Saved' : 'Applied'}
              </>
            ) : targetMode ? (
              'Save'
            ) : (
              'Apply'
            )}
          </button>
          {appliedForLocale && !justApplied && (
            <div className="mt-1.5 text-[10.5px] text-gray-400">
              {targetMode ? 'Saved' : 'Applied'} {currentLocaleLabel} {targetMode ? 'translation' : 'draft'}: "
              {appliedForLocale}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// One editable id/en/vi reference line. Source text used to be read-only
// here — fixing a typo meant switching the whole panel's locale away from
// whatever target language was being worked on. Saves through the same
// `overrides` map as everything else (id/en/vi overrides already existed
// for QA wording tests; this just adds a faster, inline way to write one)
// so it shows up everywhere else that reads overrides — the sidebar list,
// the live preview when that locale is active, and the .xlsx export.
function SourceStringRow({
  srcLocale,
  entryKey,
  original,
  overrideText,
  isActiveLocale,
  onSave,
  onReset,
}: {
  srcLocale: SourceLocale
  entryKey: string
  original: string
  overrideText: string | undefined
  isActiveLocale: boolean
  onSave: (text: string) => void
  onReset: () => void
}) {
  const effective = overrideText ?? original
  const edited = overrideText !== undefined && overrideText !== original
  const [draft, setDraft] = useState(effective)
  const taRef = useRef<HTMLTextAreaElement>(null)
  // Escape reverts the draft then blurs, which fires onBlur -> commit() —
  // but commit() closes over `draft` from the same render as this handler,
  // so it would still see the pre-revert text (setDraft hasn't flushed yet)
  // and save THAT. A ref flag skips that one commit instead, since refs
  // (unlike state) are visible immediately, with no render round-trip.
  const skipNextCommitRef = useRef(false)

  useEffect(() => {
    setDraft(effective)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryKey, srcLocale, effective])

  // Auto-grows to fit content, same as the read-only text it replaced
  // wrapped instead of clipping to a fixed box height.
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft])

  function commit() {
    if (skipNextCommitRef.current) {
      skipNextCommitRef.current = false
      return
    }
    const trimmed = draft.trim()
    if (trimmed === '') {
      if (overrideText !== undefined) onReset()
      setDraft(original)
      return
    }
    if (draft !== effective) onSave(draft)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      skipNextCommitRef.current = true
      setDraft(effective)
      e.currentTarget.blur()
    }
  }

  return (
    <div className={`rounded-md px-2 py-1 ${isActiveLocale ? 'bg-imely-mint/40' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-semibold text-[12px]">{LOCALE_LABEL[srcLocale]}:</span>
        {edited && (
          <button
            onClick={() => {
              onReset()
              setDraft(original)
            }}
            title="Revert to the original sheet text"
            className="text-gray-400 hover:text-imely-primary flex items-center gap-0.5 text-[10px]"
          >
            <RotateCcw size={10} /> reset
          </button>
        )}
      </div>
      <textarea
        ref={taRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        rows={1}
        className="w-full text-[12px] text-imely-ink bg-transparent border border-transparent hover:border-imely-line focus:border-imely-primary focus:bg-white rounded-md px-1 py-0.5 -mx-1 outline-none resize-none overflow-hidden"
      />
    </div>
  )
}
