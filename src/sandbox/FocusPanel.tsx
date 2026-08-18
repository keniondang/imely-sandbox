import { useState } from 'react'
import {
  X,
  Search,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LOCALE_LABEL, SOURCE_LOCALES, TARGET_LOCALES } from '../lib/strings'
import { useTranslationEditor } from '../hooks/useTranslationEditor'
import { FILTERS } from './browseConfig'

// The one-string-at-a-time counterpart to Inspector + TranslationPanel —
// swapped in for both of them (see App.tsx) rather than just hiding parts
// of the sidebar, so this reads as its own purpose-built screen: a big
// centered card next to the (shrunk) live preview, not a cramped list with
// one panel emptied out. Shares every bit of editing/navigation logic with
// TranslationPanel via useTranslationEditor — only the layout differs.
export function FocusPanel() {
  const {
    setFocusMode,
    targetLocale,
    setTargetLocale,
    baseLocale,
    setBaseLocale,
    filterMode,
    setFilterMode,
    query,
    setQuery,
  } = useApp()
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
    canPrevRow,
    canNextRow,
    goRow,
    goNextUntranslated,
    handleChange,
    handleApply,
    handleReset,
    handleTextareaKeyDown,
    copyKey,
  } = useTranslationEditor()

  const groupLabel = overlayIndex >= 0 ? overlaySections[overlayIndex]?.label : null
  const pageLabel = pageIndex >= 0 ? pageSections[pageIndex]?.label : null

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="shrink-0 bg-white border-b border-imely-line px-4 py-2.5 flex items-center gap-2 flex-wrap">
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

        <div className="h-4 w-px bg-imely-line mx-0.5 shrink-0" />

        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map((f) => {
            const active = filterMode === f.id
            const activeClass =
              f.id === 'untranslated'
                ? 'bg-amber-500 border-amber-500 text-white'
                : f.id === 'translated'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-imely-primary border-imely-primary text-white'
            return (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`text-[10.5px] font-medium px-2 py-1 rounded-full border ${
                  active ? activeClass : 'border-imely-line text-gray-500'
                }`}
              >
                {f.label}
              </button>
            )
          })}
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

      <div className="flex-1 overflow-y-auto flex items-center justify-center gap-3 p-6">
        <button
          onClick={() => goRow(-1)}
          disabled={!canPrevRow}
          title="Previous string"
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-imely-line shadow-sm flex items-center justify-center text-imely-ink disabled:opacity-25 hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ChevronLeft size={18} />
        </button>

        {entry ? (
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-imely-line flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-imely-line flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-imely-primary uppercase truncate">
                  {pageLabel}
                  {groupLabel && groupLabel !== 'Page' ? ` › ${groupLabel}` : ''}
                </div>
                <div className="flex items-center gap-1 mt-0.5 min-w-0">
                  <div className="font-mono text-[10.5px] text-gray-400 truncate">{entry.key}</div>
                  <button onClick={copyKey} className="text-gray-300 hover:text-gray-500 shrink-0">
                    {copied ? <Check size={11} className="text-imely-primary" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 shrink-0">
                {rowIndex + 1} / {rows.length}
              </div>
            </div>

            <div className="px-6 py-5 flex-1 overflow-y-auto">
              {!wired && (
                <div className="mb-3 text-[11px] text-amber-600 bg-amber-50 rounded-md px-2.5 py-1.5">
                  Not wired into a screen in this build yet — locale values only.
                </div>
              )}
              {overflowFlag && wired && (
                <div className="mb-3 flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 rounded-md px-2.5 py-1.5">
                  <AlertTriangle size={13} /> Text overflows its container at this length
                </div>
              )}

              <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">
                {LOCALE_LABEL[baseLocale]} · source
              </div>
              <div className="text-[17px] text-imely-ink leading-relaxed mb-5">
                {entry.locales[baseLocale] || entry.locales.en || entry.locales.id}
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-imely-primary uppercase">
                  {currentLocaleLabel} · translation
                </span>
                {savedTranslation && (
                  <button
                    onClick={handleReset}
                    title="Clear this translation"
                    className="flex items-center gap-1 text-[10.5px] text-gray-400 hover:text-imely-primary"
                  >
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>
              {aiSuggestion ? (
                <button
                  onClick={() => handleChange(aiSuggestion)}
                  className="mb-2 w-full text-left text-[12px] bg-imely-mint/30 hover:bg-imely-mint/50 rounded-lg px-3 py-2 flex items-start gap-1.5 text-imely-ink transition-colors"
                >
                  <Sparkles size={12} className="text-imely-primary shrink-0 mt-0.5" />
                  <span>{aiSuggestion}</span>
                </button>
              ) : (
                <div className="mb-2 text-[11px] text-gray-300 italic">No AI suggestion yet</div>
              )}
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={`Type the ${currentLocaleLabel} translation…`}
                className="w-full text-[16px] text-imely-ink outline-none resize-none bg-gray-50 border border-imely-line rounded-xl px-3.5 py-3 focus:border-imely-primary placeholder:text-gray-300"
                rows={4}
              />

              <div className="mt-3 space-y-1">
                {SOURCE_LOCALES.filter((l) => l !== baseLocale).map((l) => (
                  <div key={l} className="flex items-baseline gap-1.5 text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-500 shrink-0">{LOCALE_LABEL[l]}:</span>
                    <span className="truncate">{entry.locales[l]}</span>
                  </div>
                ))}
              </div>

              {draftText.trim() && draftText !== (savedTranslation ?? '') && (
                <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Unsaved changes
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-imely-line flex items-center gap-2">
              <button
                onClick={handleApply}
                disabled={!draftText.trim()}
                className="flex-1 bg-imely-primary text-white text-[13px] font-bold rounded-full py-2.5 flex items-center justify-center gap-1.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform disabled:opacity-40"
              >
                {justApplied ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : (
                  'Save & Next'
                )}
              </button>
              <button
                onClick={goNextUntranslated}
                title="Jump to the next string with no translation yet"
                className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-imely-primary px-3 py-2.5 rounded-full hover:bg-imely-mint/30 active:scale-[0.98] transition-transform"
              >
                <SkipForward size={13} /> Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-imely-line p-10 text-center text-[13px] text-gray-400">
            No strings match the current filter/search.
          </div>
        )}

        <button
          onClick={() => goRow(1)}
          disabled={!canNextRow}
          title="Next string"
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-imely-line shadow-sm flex items-center justify-center text-imely-ink disabled:opacity-25 hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
