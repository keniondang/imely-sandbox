import { useEffect, useMemo, useState } from 'react'
import {
  X,
  Search,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LOCALE_LABEL, SOURCE_LOCALES, TARGET_LOCALES } from '../lib/strings'
import { useTranslationEditor } from '../hooks/useTranslationEditor'
import type { BrowseRow, BrowseSection } from '../hooks/useBrowseOrder'

// The one-string-at-a-time counterpart to Inspector + TranslationPanel —
// swapped in for both of them (see App.tsx) rather than just hiding parts
// of the sidebar, so this reads as its own purpose-built screen: a full
// section with generous type, a real Page/Group nav (so a translator can
// see and move through the same structure the sidebar tree shows, without
// the sidebar itself), and a progress bar at every tier. Shares every bit
// of editing/navigation logic with TranslationPanel via
// useTranslationEditor — only the layout differs.
export function FocusPanel() {
  const { setFocusMode, targetLocale, setTargetLocale, baseLocale, setBaseLocale, query, setQuery, overrides } =
    useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const {
    currentLocaleLabel,
    entry,
    wired,
    savedTranslation,
    aiSuggestion,
    draftText,
    overflowFlag,
    justApplied,
    copied,
    textareaRef,
    rows,
    rowIndex,
    pageSections,
    pageIndex,
    overlaySections,
    overlayIndex,
    overlaySiblings,
    overlaySiblingIndex,
    canPrevRow,
    canNextRow,
    canPrevOverlay,
    canNextOverlay,
    canPrevPage,
    canNextPage,
    pageUnitLabel,
    goRow,
    goOverlay,
    goPage,
    handleChange,
    handleApply,
    handleReset,
    handleTextareaKeyDown,
    copyKey,
  } = useTranslationEditor()

  // Where the current row sits within a given section (a page, or a group
  // within it) — "3rd of 10 in this page", counting up with Prev/Next
  // regardless of translated state. A completion count ("6 of 10
  // translated") reads ambiguously right next to Prev/Next controls, and
  // Save & Next can jump to the next untranslated row ANYWHERE in the
  // queue — often a different page/group entirely — so it wouldn't count
  // up predictably here either; plain position does.
  function sectionPosition(section: BrowseSection | undefined, atRowIndex: number) {
    if (!section) return { pos: 0, total: 0 }
    return { pos: atRowIndex - section.startIndex + 1, total: section.endIndex - section.startIndex + 1 }
  }
  const pagePosition = useMemo(
    () => sectionPosition(pageSections[pageIndex], rowIndex),
    [pageSections, pageIndex, rowIndex]
  )
  const groupPosition = useMemo(
    () => sectionPosition(overlaySections[overlayIndex], rowIndex),
    [overlaySections, overlayIndex, rowIndex]
  )

  // How much of a given section (a page, or a group within it) already has
  // a saved translation — separate from position above, which only tracks
  // where you are, not what's actually done. Shown as its own strip under
  // the overall queue bar so completion and position don't get conflated
  // into one ambiguous number the way the nav bar's did before.
  function sectionCompletion(section: BrowseSection | undefined, allRows: BrowseRow[]) {
    if (!section) return { done: 0, total: 0 }
    let done = 0
    const total = section.endIndex - section.startIndex + 1
    for (let i = section.startIndex; i <= section.endIndex; i++) {
      if (overrides[allRows[i].key]?.[targetLocale]) done++
    }
    return { done, total }
  }
  const pageCompletion = useMemo(
    () => sectionCompletion(pageSections[pageIndex], rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageSections, pageIndex, rows, overrides, targetLocale]
  )
  const groupCompletion = useMemo(
    () => sectionCompletion(overlaySections[overlayIndex], rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overlaySections, overlayIndex, rows, overrides, targetLocale]
  )

  // A peek at what Prev/Next actually land on — named, not just an arrow —
  // so a translator can tell at a glance whether it's worth stepping there
  // instead of discovering it only after clicking.
  const prevPageLabel = canPrevPage ? pageSections[pageIndex - 1]?.label : undefined
  const nextPageLabel = canNextPage ? pageSections[pageIndex + 1]?.label : undefined
  // Group prev/next walks `overlaySiblings` (this page's own groups), not
  // `overlaySections` (every screen's) — matching goOverlay itself, or the
  // peek would show a group from a completely different page.
  const prevGroupLabel = canPrevOverlay ? overlaySiblings[overlaySiblingIndex - 1]?.label : undefined
  const nextGroupLabel = canNextOverlay ? overlaySiblings[overlaySiblingIndex + 1]?.label : undefined

  // How much of THIS queue (whatever filter/search is active) already has a
  // saved translation — a translator working through it end to end watches
  // this climb to 100%, a much more motivating signal than the static
  // row-position counter alone.
  const translatedCount = rows.filter((r) => overrides[r.key]?.[targetLocale]).length
  const totalCount = rows.length
  const pct = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0

  // Left/Right steps through the queue like Prev/Next, as long as focus
  // isn't in the search box or the translation textarea itself (where those
  // keys need to move the text cursor, not navigate away from the string).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if (e.key === 'ArrowLeft' && canPrevRow) goRow(-1)
      else if (e.key === 'ArrowRight' && canNextRow) goRow(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goRow, canPrevRow, canNextRow])

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="shrink-0 border-b border-imely-line px-5 py-3 flex items-center gap-2.5">
        <button
          onClick={() => setFocusMode(false)}
          title="Exit Focus Mode"
          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 px-2.5 py-1.5 rounded-full border border-imely-line hover:bg-gray-50 active:scale-95 transition-transform shrink-0"
        >
          <X size={12} /> Exit Focus
        </button>

        <div className="h-4 w-px bg-imely-line mx-0.5 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          {TARGET_LOCALES.map((id) => (
            <button
              key={id}
              onClick={() => setTargetLocale(id)}
              title="Translate into this language"
              className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                targetLocale === id
                  ? 'bg-imely-primary text-white border-imely-primary'
                  : 'border-imely-line text-gray-500'
              }`}
            >
              {LOCALE_LABEL[id]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0" title="Reference language">
          <span className="text-[10px] text-gray-400">Base:</span>
          {SOURCE_LOCALES.map((id) => (
            <button
              key={id}
              onClick={() => setBaseLocale(id)}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                baseLocale === id ? 'bg-gray-100 text-imely-ink border-gray-300' : 'border-imely-line text-gray-400'
              }`}
            >
              {LOCALE_LABEL[id]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {searchOpen ? (
          <div className="relative shrink-0">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setSearchOpen(false)}
              placeholder="Search keys…"
              className="w-40 text-[11.5px] bg-gray-50 border border-imely-line rounded-full pl-7 pr-6 py-1.5 outline-none focus:border-imely-primary"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="shrink-0 text-gray-400 hover:text-imely-ink p-1.5 rounded-full hover:bg-gray-50"
          >
            <Search size={14} />
          </button>
        )}
      </div>

      {/* overall queue progress — how far through the whole filtered/searched
          list (spanning every page/group) this session has gotten. Sits
          above the Page/Group nav so it's the first thing read, not buried
          under two rows of per-section detail. */}
      <div className="shrink-0 px-6 py-2.5 border-b border-imely-line">
        <div className="flex items-center justify-between text-[11.5px] text-gray-500 mb-1.5">
          <span>
            <span className="font-semibold text-imely-ink">{translatedCount.toLocaleString()}</span> /{' '}
            {totalCount.toLocaleString()} translated in this queue
          </span>
          <span className="font-bold text-imely-primary">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-imely-primary rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* completion for just the current page/group — how much of what
            you're looking at right now is actually done, separate from the
            overall queue bar above and from the nav bar's position counters
            below, which only track where you are, not what's finished. */}
        <div className="flex items-center gap-5 mt-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate max-w-[150px]">
              <span className="font-semibold">{pageUnitLabel}</span>{' '}
              <span className="font-semibold text-gray-600 normal-case">
                {pageIndex >= 0 ? pageSections[pageIndex]?.label : '—'}
              </span>{' '}
              done
            </span>
            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
              <div
                className="h-full bg-imely-ink/60 rounded-full transition-all duration-300"
                style={{ width: `${pageCompletion.total ? (pageCompletion.done / pageCompletion.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10.5px] text-gray-400 tabular-nums shrink-0">
              {pageCompletion.done}/{pageCompletion.total}
            </span>
          </div>
          {overlaySiblings.length > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate max-w-[150px]">
                <span className="font-semibold">Group</span>{' '}
                <span className="font-semibold text-gray-600 normal-case">
                  {overlayIndex >= 0 ? overlaySections[overlayIndex]?.label : '—'}
                </span>{' '}
                done
              </span>
              <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
                <div
                  className="h-full bg-imely-primary/60 rounded-full transition-all duration-300"
                  style={{
                    width: `${groupCompletion.total ? (groupCompletion.done / groupCompletion.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-[10.5px] text-gray-400 tabular-nums shrink-0">
                {groupCompletion.done}/{groupCompletion.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Page / Group nav — the same structure the sidebar tree shows,
          reachable here without needing the sidebar mounted, AND the page's
          heading (name + row position) — folded into one bar instead of
          repeating the same "where am I" info a second time as a separate
          heading further down. Each tier carries its own progress bar,
          scoped to just that section's rows. */}
      <div className="shrink-0 border-b border-imely-line px-6 py-3.5 space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-[136px] shrink-0 text-[10.5px] text-gray-400 truncate text-right"
            title={prevPageLabel}
          >
            {prevPageLabel && (
              <>
                Previous: <span className="text-gray-500 font-medium">{prevPageLabel}</span>
              </>
            )}
          </span>
          <button
            onClick={() => goPage(-1)}
            disabled={!canPrevPage}
            title={prevPageLabel ? `Previous ${pageUnitLabel}: ${prevPageLabel}` : `Previous ${pageUnitLabel}`}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                  {pageUnitLabel}
                </span>
                <span className="text-[17px] font-bold text-imely-ink truncate">
                  {pageIndex >= 0 ? pageSections[pageIndex]?.label : '—'}
                </span>
                {!wired && (
                  <span className="shrink-0 text-[9.5px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    Unwired
                  </span>
                )}
              </span>
              <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                {pagePosition.pos}/{pagePosition.total} here
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-imely-ink/60 rounded-full transition-all duration-300"
                style={{ width: `${pagePosition.total ? (pagePosition.pos / pagePosition.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => goPage(1)}
            disabled={!canNextPage}
            title={nextPageLabel ? `Next ${pageUnitLabel}: ${nextPageLabel}` : `Next ${pageUnitLabel}`}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsRight size={18} />
          </button>
          <span className="w-[136px] shrink-0 text-[10.5px] text-gray-400 truncate" title={nextPageLabel}>
            {nextPageLabel && (
              <>
                Next: <span className="text-gray-500 font-medium">{nextPageLabel}</span>
              </>
            )}
          </span>
        </div>

        {/* Only shown when this page actually has Menu/Popup groups to step
            through — e.g. Beranda has none, so the row just disappears
            instead of sitting there permanently disabled. */}
        {overlaySiblings.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span
              className="w-[136px] shrink-0 text-[10px] text-gray-400 truncate text-right"
              title={prevGroupLabel}
            >
              {prevGroupLabel && (
                <>
                  Previous: <span className="text-gray-500 font-medium">{prevGroupLabel}</span>
                </>
              )}
            </span>
            <button
              onClick={() => goOverlay(-1)}
              disabled={!canPrevOverlay}
              title={prevGroupLabel ? `Previous group: ${prevGroupLabel}` : 'Previous group (Menu/Popup within this screen)'}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                    Group
                  </span>
                  <span className="text-[13.5px] font-bold text-imely-ink truncate">
                    {overlayIndex >= 0 ? overlaySections[overlayIndex]?.label : '—'}
                  </span>
                </span>
                <span className="text-[10.5px] text-gray-400 shrink-0 tabular-nums">
                  {groupPosition.pos}/{groupPosition.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-imely-primary/60 rounded-full transition-all duration-300"
                  style={{ width: `${groupPosition.total ? (groupPosition.pos / groupPosition.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => goOverlay(1)}
              disabled={!canNextOverlay}
              title={nextGroupLabel ? `Next group: ${nextGroupLabel}` : 'Next group (Menu/Popup within this screen)'}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
            <span className="w-[136px] shrink-0 text-[10px] text-gray-400 truncate" title={nextGroupLabel}>
              {nextGroupLabel && (
                <>
                  Next: <span className="text-gray-500 font-medium">{nextGroupLabel}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {entry ? (
          <div className="max-w-2xl mx-auto px-8 py-7 min-h-full flex flex-col">
            <div className="flex items-center gap-1.5 mb-7">
              <div className="font-mono text-[11.5px] text-gray-400">{entry.key}</div>
              <button onClick={copyKey} className="text-gray-300 hover:text-gray-500">
                {copied ? <Check size={11} className="text-imely-primary" /> : <Copy size={11} />}
              </button>
            </div>

            {overflowFlag && wired && (
              <div className="mb-4 flex items-center gap-1.5 text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
                <AlertTriangle size={14} /> Text overflows its container at this length
              </div>
            )}

            <div className="text-[12.5px] font-semibold text-gray-400 uppercase mb-2">
              {LOCALE_LABEL[baseLocale]} · source
            </div>
            <div className="text-[23px] text-imely-ink leading-snug mb-8">
              {entry.locales[baseLocale] || entry.locales.en || entry.locales.id}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] font-semibold text-imely-primary uppercase">
                {currentLocaleLabel} · translation
              </span>
              {savedTranslation && (
                <button
                  onClick={handleReset}
                  title="Clear this translation"
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-imely-primary"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              )}
            </div>
            {aiSuggestion ? (
              <button
                onClick={() => handleChange(aiSuggestion)}
                className="mb-2.5 w-full text-left text-[13px] bg-imely-mint/30 hover:bg-imely-mint/50 rounded-xl px-3.5 py-2.5 flex items-start gap-2 text-imely-ink transition-colors"
              >
                <Sparkles size={13} className="text-imely-primary shrink-0 mt-0.5" />
                <span>{aiSuggestion}</span>
              </button>
            ) : (
              <div className="mb-2.5 text-[11.5px] text-gray-300 italic">No AI suggestion yet</div>
            )}
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={`Type the ${currentLocaleLabel} translation…`}
              className="w-full flex-1 min-h-[140px] text-[19px] text-imely-ink outline-none resize-none bg-gray-50 border-2 border-imely-line rounded-2xl px-4 py-3.5 focus:border-imely-primary focus:bg-white transition-colors placeholder:text-gray-300"
              rows={5}
            />

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              {SOURCE_LOCALES.filter((l) => l !== baseLocale).map((l) => (
                <div key={l} className="flex items-baseline gap-1.5 text-[12px] text-gray-400">
                  <span className="font-semibold text-gray-500 shrink-0">{LOCALE_LABEL[l]}:</span>
                  <span>{entry.locales[l]}</span>
                </div>
              ))}
            </div>

            {draftText.trim() && draftText !== (savedTranslation ?? '') && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Unsaved changes
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center px-8 text-center text-[14px] text-gray-400">
            No strings match the current filter/search.
          </div>
        )}
      </div>

      {/* bottom action bar — Prev/Next as real buttons, not side arrows, so
          the whole panel reads as one continuous review flow */}
      <div className="shrink-0 border-t border-imely-line px-6 py-4 flex items-center gap-2.5">
        <button
          onClick={() => goRow(-1)}
          disabled={!canPrevRow}
          title="Previous string (←)"
          className="shrink-0 flex items-center gap-1 text-[13px] font-semibold text-imely-ink px-4 py-3 rounded-full border border-imely-line hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.97] transition-transform"
        >
          <ChevronLeft size={17} /> Previous
        </button>

        <button
          onClick={handleApply}
          disabled={!draftText.trim()}
          className="flex-1 bg-imely-primary text-white text-[14.5px] font-bold rounded-full py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] active:bg-imely-primaryDark transition-transform disabled:opacity-40"
        >
          {justApplied ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            'Save & Next'
          )}
        </button>

        <button
          onClick={() => goRow(1)}
          disabled={!canNextRow}
          title="Next string (→)"
          className="shrink-0 flex items-center gap-1 text-[13px] font-semibold text-imely-ink px-4 py-3 rounded-full border border-imely-line hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent active:scale-[0.97] transition-transform"
        >
          Next <ChevronRight size={17} />
        </button>
      </div>
    </div>
  )
}
