import {
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
import { LOCALE_LABEL, SOURCE_LOCALES } from '../lib/strings'
import { useTranslationEditor } from '../hooks/useTranslationEditor'

// The right-side counterpart to the Inspector's browse/search list — picking
// a key over there shows it here. Kept as its own panel (rather than a
// detail block bolted under the list) so there's room for the original
// string, a real draft-then-Save workflow, and overflow feedback without
// squeezing the list itself. Only rendered in normal mode — Focus Mode
// swaps this + the Inspector out for FocusPanel instead (see App.tsx). The
// Focus Mode toggle itself lives in the main title bar now (see App.tsx),
// not here — bigger and in one consistent spot regardless of whether a
// string happens to be selected.
export function TranslationPanel() {
  const {
    baseLocale,
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

  if (!entry) {
    return (
      <div className="w-[360px] shrink-0 h-full border-r border-line bg-surface flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[13px] text-muted">
            Select a string from the list on the left to translate it here.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[360px] shrink-0 h-full border-r border-line bg-surface flex flex-col">
      <div className="px-3 py-2 border-b border-line space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => goPage(-1)}
            disabled={!canPrevPage}
            title={`Previous ${pageUnitLabel}`}
            className="flex items-center gap-0.5 text-[10.5px] text-muted px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft size={12} /> {pageUnitLabel}
          </button>
          <div
            className="text-[10.5px] text-muted truncate max-w-[130px] text-center"
            title={pageSections[pageIndex]?.label}
          >
            {pageIndex >= 0 ? pageSections[pageIndex]?.label : '—'}
          </div>
          <button
            onClick={() => goPage(1)}
            disabled={!canNextPage}
            title={`Next ${pageUnitLabel}`}
            className="flex items-center gap-0.5 text-[10.5px] text-muted px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
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
            className="flex items-center gap-0.5 text-[10.5px] text-muted px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={12} /> Group
          </button>
          <div
            className="text-[10.5px] text-muted truncate max-w-[110px] text-center"
            title={overlaySections[overlayIndex]?.label}
          >
            {overlayIndex >= 0 ? overlaySections[overlayIndex]?.label : '—'}
          </div>
          <button
            onClick={() => goOverlay(1)}
            disabled={!canNextOverlay}
            title="Next group (Menu/Popup within this screen)"
            className="flex items-center gap-0.5 text-[10.5px] text-muted px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Group <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => goRow(-1)}
            disabled={!canPrevRow}
            title="Previous string"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-ink px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <div className="text-[10.5px] text-muted shrink-0">
            {rowIndex >= 0 ? `${rowIndex + 1} / ${rows.length}` : '—'}
          </div>
          <button
            onClick={() => goRow(1)}
            disabled={!canNextRow}
            title="Next string"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-ink px-2 py-1 rounded-md hover:bg-subtle disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-1 min-w-0">
          <div className="font-mono text-[11px] text-muted break-all flex-1">{entry.key}</div>
          <button
            onClick={copyKey}
            title="Copy key"
            className="text-muted shrink-0 active:scale-90 transition-transform"
          >
            {copied ? <Check size={12} className="text-imely-primary" /> : <Copy size={12} />}
          </button>
        </div>
        <div className="text-[10px] text-muted mt-0.5">
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
        <div className="mt-3 rounded-xl border border-line overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="p-2.5 bg-subtle">
              <div className="text-[10px] font-semibold text-muted uppercase mb-1">
                {LOCALE_LABEL[baseLocale]} · source
              </div>
              {entry.locales[baseLocale] || entry.locales.en || entry.locales.id ? (
                <div className="text-[13.5px] text-ink leading-snug">
                  {entry.locales[baseLocale] || entry.locales.en || entry.locales.id}
                </div>
              ) : (
                <div className="text-[11.5px] text-amber-600 italic">No source text in the sheet</div>
              )}
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
                    className="text-muted hover:text-imely-primary"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
              </div>
              {aiSuggestion ? (
                <button
                  onClick={() => handleChange(aiSuggestion)}
                  className="mb-1.5 w-full text-left text-[10.5px] bg-imely-mint/30 hover:bg-imely-mint/50 rounded-md px-1.5 py-1 flex items-start gap-1 text-ink transition-colors"
                >
                  <Sparkles size={10} className="text-imely-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{aiSuggestion}</span>
                </button>
              ) : (
                <div className="mb-1.5 text-[10px] text-faint italic">No AI suggestion yet</div>
              )}
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={`Type the ${currentLocaleLabel} translation…`}
                className="w-full text-[13.5px] text-ink outline-none resize-none overflow-hidden bg-transparent placeholder:text-faint"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Other 2 source languages — still available, just de-emphasized
            since the base-language column above covers the primary case. */}
        <div className="mt-2 space-y-1 px-0.5">
          {SOURCE_LOCALES.filter((l) => l !== baseLocale).map((l) => (
            <div key={l} className="flex items-baseline gap-1.5 text-[10.5px] text-muted">
              <span className="font-semibold text-muted shrink-0">{LOCALE_LABEL[l]}:</span>
              <span className={`truncate ${entry.locales[l] ? '' : 'text-faint italic'}`}>
                {entry.locales[l] || '—'}
              </span>
            </div>
          ))}
        </div>

        {draftText.trim() && draftText !== (savedTranslation ?? '') && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Unsaved changes
          </div>
        )}
        <div className="mt-2 text-[10px] text-faint">Ctrl/Cmd + Enter to save</div>
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
