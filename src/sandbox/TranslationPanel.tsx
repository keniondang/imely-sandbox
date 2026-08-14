import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getEntry, type Locale } from '../lib/strings'
import { buildStrSelector } from '../components/Str'
import { useBrowseOrder, type BrowseRow } from '../hooks/useBrowseOrder'
import { useNavigateToString } from '../hooks/useNavigateToString'
import { ZONE_TYPE } from '../sandbox/browseConfig'

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
      <div className="w-[300px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-[13px] text-gray-400">
          Select a string from the list on the left to view and test its translation here.
        </div>
      </div>
    )
  }

  const currentLocaleLabel = LOCALES.find((l) => l.id === locale)?.label ?? locale

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
            Draft translation ({currentLocaleLabel})
            {appliedForLocale && (
              <button onClick={handleReset} className="text-gray-400 flex items-center gap-0.5">
                <RotateCcw size={11} /> reset
              </button>
            )}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type a draft translation to test overflow…"
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
                <Check size={13} /> Applied
              </>
            ) : (
              'Apply'
            )}
          </button>
          {appliedForLocale && !justApplied && (
            <div className="mt-1.5 text-[10.5px] text-gray-400">
              Applied {currentLocaleLabel} draft: "{appliedForLocale}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
