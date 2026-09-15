import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { getAiSuggestion, getEntry, isConfirmed, LOCALE_LABEL, type TargetLocale } from '../lib/strings'
import { buildStrSelector } from '../components/Str'
import { useBrowseOrder, type BrowseRow } from './useBrowseOrder'
import { useNavigateToString } from './useNavigateToString'
import { ZONE_TYPE } from '../sandbox/browseConfig'

// Snapshot of a save, taken right before it happens — captures whatever was
// there immediately prior so Undo can put it back exactly, review status
// included (see restoreOverride in AppContext). Kept separate from
// `savedTranslation` (the CURRENT saved value) since the whole point is
// remembering the PREVIOUS one.
interface UndoSnapshot {
  key: string
  locale: TargetLocale
  screenId: ScreenId | null
  zone: Zone | null
  previousValue: string | undefined
  previousReviewed: boolean
}

// How long the Undo affordance stays available after a save — long enough
// to notice past the brief "Saved" checkmark flash (which auto-advance
// usually outlives), short enough that it doesn't linger as a trap for
// undoing some much-later, unrelated save.
const UNDO_WINDOW_MS = 8000

// All the state/logic behind editing whichever string is currently
// selected — draft-then-Save, prev/next at the string/group/page tier, AI
// suggestion, overflow detection. Split out of FocusPanel (Translation
// Mode's one-at-a-time editor) into its own hook to keep that file's JSX
// from being buried under its state/navigation logic.
export function useTranslationEditor() {
  const {
    targetLocale,
    baseLocale,
    usage,
    overrides,
    reviewed,
    applyOverride,
    resetOverride,
    restoreOverride,
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
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // rowIndex lands on -1 two different ways, both fixed the same way: the
  // queue can shrink out from under the current selection (a filter or
  // search narrows `rows`, or the Unwired filter is toggled on while a
  // wired key was selected), or nothing was ever selected in the first
  // place (opening Translation Mode straight from the landing screen,
  // where nothing is auto-selected — see useLivePreviewFollow's arming
  // delay). Left alone, either one shows "no strings match" with Prev/Next
  // silently disabled. Snap to the first row of the current queue instead,
  // so entering the panel — or switching filters once inside it — always
  // lands somewhere navigable.
  useEffect(() => {
    if (rowIndex !== -1 || rows.length === 0) return
    const target = rows[0]
    navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
    syncInspectorFocus(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, rowIndex, selectedKey])

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

  // Next string that isn't confirmed yet (see isConfirmed) — either truly
  // blank, or (th-only) pre-filled from the sheet but not yet reviewed —
  // searching forward from wherever we are and wrapping around. Lets a
  // translator resume mid-list without hunting for where they left off,
  // and for th walks straight through the whole needs-review backlog the
  // same way it always walked through blanks.
  function nextUntranslatedRow(): BrowseRow | undefined {
    for (let i = rowIndex + 1; i < rows.length; i++) {
      if (!isConfirmed(rows[i].key, targetLocale, overrides, reviewed)) return rows[i]
    }
    for (let i = 0; i <= rowIndex; i++) {
      if (!isConfirmed(rows[i].key, targetLocale, overrides, reviewed)) return rows[i]
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
  // Has a value but isn't confirmed yet (th-only, see isConfirmed) — a
  // pre-filled sheet value nobody's actually looked at. FocusPanel shows a
  // distinct badge for this so it doesn't read identically to a translator's
  // own already-reviewed work.
  const needsReview = Boolean(
    selectedKey && savedTranslation && !isConfirmed(selectedKey, targetLocale, overrides, reviewed)
  )
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
    // Snapshot whatever was there right before this save overwrites it, so
    // Undo can put back the exact prior value AND its review status — not
    // just re-apply old text and have that wrongly count as freshly
    // reviewed. Occurrence is captured too, purely so Undo can jump back to
    // where this string lives instead of leaving the translator on whatever
    // row auto-advance already moved them to.
    const snapshot: UndoSnapshot = {
      key: selectedKey,
      locale: targetLocale,
      screenId: selectedOccurrence?.screenId ?? null,
      zone: selectedOccurrence?.zone ?? null,
      previousValue: overrides[selectedKey]?.[targetLocale],
      previousReviewed: Boolean(reviewed[selectedKey]?.[targetLocale]),
    }
    applyOverride(selectedKey, targetLocale, draftText)
    setLivePreview(null)
    setJustApplied(true)
    setTimeout(() => setJustApplied(false), 1200)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoSnapshot(snapshot)
    undoTimer.current = setTimeout(() => setUndoSnapshot(null), UNDO_WINDOW_MS)
    // Translating into a new language is a long march through ~1,500 keys —
    // auto-advancing to the next gap keeps a translator's hands on the
    // keyboard instead of re-hunting the list after every save.
    const target = nextUntranslatedRow()
    if (target) {
      navigateTo(target.key, target.screenId ?? undefined, target.zone ?? undefined)
      syncInspectorFocus(target)
    }
  }

  function handleUndo() {
    if (!undoSnapshot) return
    const { key, locale, screenId, zone, previousValue, previousReviewed } = undoSnapshot
    restoreOverride(key, locale, previousValue, previousReviewed)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoSnapshot(null)
    // Jump back to the undone string so the translator lands somewhere that
    // visibly reflects the revert, rather than staying on whatever row
    // auto-advance had already moved them to.
    navigateTo(key, screenId ?? undefined, zone ?? undefined)
    const row = rows.find((r) => r.key === key && r.screenId === screenId && r.zone === zone)
    if (row) syncInspectorFocus(row)
    // If we're already sitting on the undone key/locale (auto-advance never
    // moved us, or Undo brought us right back to it), the [selectedKey,
    // targetLocale]-keyed resync effect below won't refire on its own —
    // refresh the draft here instead.
    if (key === selectedKey && locale === targetLocale) {
      setDraftText(previousValue ?? '')
      setLivePreview(null)
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

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
    }
  }, [])

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

  return {
    targetLocale,
    baseLocale,
    currentLocaleLabel: LOCALE_LABEL[targetLocale],
    entry,
    wired,
    savedTranslation,
    needsReview,
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
    goNextUntranslated,
    handleChange,
    handleApply,
    handleUndo,
    canUndo: undoSnapshot !== null,
    handleReset,
    handleTextareaKeyDown,
    copyKey,
  }
}
