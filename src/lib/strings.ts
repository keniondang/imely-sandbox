import rawStrings from '../data/strings.json'
import rawAiSuggestions from '../data/aiSuggestions.json'

// Source locales already exist in the sheet — read-only reference material,
// always present on every entry. Target locales are the languages being
// produced FOR THE FIRST TIME in this tool: there's no baseline value to
// compare against, so a translator's input in one of these isn't "testing an
// alternate wording" the way an id/en/vi override is — it IS the translation.
export type SourceLocale = 'id' | 'en' | 'vi'
export type TargetLocale = 'zh-TW' | 'th'
export type Locale = SourceLocale | TargetLocale

export const SOURCE_LOCALES: SourceLocale[] = ['id', 'en', 'vi']
export const TARGET_LOCALES: TargetLocale[] = ['zh-TW', 'th']

export const LOCALE_LABEL: Record<Locale, string> = {
  id: 'ID',
  en: 'EN',
  vi: 'VI',
  'zh-TW': 'ZH-TW',
  th: 'TH',
}

export function isTargetLocale(locale: Locale): locale is TargetLocale {
  return (TARGET_LOCALES as Locale[]).includes(locale)
}

// Intl tag per source locale, for formatting numbers (gem counts, prices) to
// match whichever base language a translator is currently viewing — was
// hardcoded to 'id-ID' at every call site, which put Indonesian thousands
// grouping in front of an EN or VI translator regardless of their chosen base.
const NUMBER_LOCALE_TAG: Record<SourceLocale, string> = {
  id: 'id-ID',
  en: 'en-US',
  vi: 'vi-VN',
}

export function formatNumber(n: number, baseLocale: SourceLocale): string {
  return n.toLocaleString(NUMBER_LOCALE_TAG[baseLocale])
}

export interface StringEntry {
  key: string
  category: string
  subcategory: string | null
  // Only ever the 3 source locales — target locales are never in the sheet.
  locales: Partial<Record<SourceLocale, string>>
}

export const ALL_STRINGS = rawStrings as StringEntry[]

const BY_KEY = new Map<string, StringEntry>(ALL_STRINGS.map((s) => [s.key, s]))

export function getEntry(key: string): StringEntry | undefined {
  return BY_KEY.get(key)
}

// Resolve a key -> localized text in one of the SOURCE languages, with
// ${LAZY_DATA(x)} tokens swapped for placeholder mock values passed in
// `vars`. Falls back through en/id when the requested source locale has
// nothing for this key. Target-locale text never goes through here — it's
// either an applied override (checked by the caller first) or it doesn't
// exist yet, in which case this base-language fallback is what shows.
// Swaps ${LAZY_DATA(x)} tokens for mock values. Split out from resolveString
// so callers holding already-resolved text (a translator's own override, or
// a live draft) can run the same substitution without re-resolving from the
// base language — see resolveToastPreview in lib/toastPreview.ts.
export function applyVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text
  return text.replace(/\$\{LAZY_DATA\(([^)]+)\)\}/g, (_, varName) => {
    const v = vars[varName]
    return v !== undefined ? String(v) : `{${varName}}`
  })
}

export function resolveString(
  key: string,
  locale: SourceLocale,
  vars?: Record<string, string | number>
): string {
  const entry = BY_KEY.get(key)
  if (!entry) return `⚠ missing:${key}`

  const text = entry.locales[locale] || entry.locales.en || entry.locales.id || ''
  return applyVars(text, vars)
}

// For placeholder attributes — these can't be a <Str> child, so they need
// the same override-then-base-fallback precedence <Str> does inline
// (overrides[k]?.[targetLocale] ?? resolveString(k, baseLocale)) spelled out
// as a function instead. Without this, a placeholder always shows the base
// language's hint even once a translator has saved a real target-locale
// translation for it — no way to see your own translated placeholder text
// rendered in context.
export function resolvePlaceholder(
  key: string,
  targetLocale: TargetLocale,
  baseLocale: SourceLocale,
  overrides: Record<string, Partial<Record<TargetLocale, string>>>,
  vars?: Record<string, string | number>
): string {
  const override = overrides[key]?.[targetLocale]
  if (override) return applyVars(override, vars)
  return resolveString(key, baseLocale, vars)
}

export const CATEGORIES = Array.from(
  new Set(ALL_STRINGS.map((s) => String(s.category)))
).sort()

// Starting-point translations for the translator to accept, edit, or ignore
// — kept as a separate file (not part of `overrides`) since it comes from a
// different source (an AI pass, added later) rather than the translator's
// own saved work. Empty for now; populated later by filling in
// src/data/aiSuggestions.json with { [key]: { 'zh-TW': '...', th: '...' } }
// entries — the moment a key has one, the Translation panel picks it up
// with no further code changes.
export type AiSuggestions = Record<string, Partial<Record<TargetLocale, string>>>
export const AI_SUGGESTIONS = rawAiSuggestions as AiSuggestions

export function getAiSuggestion(key: string, locale: TargetLocale): string | undefined {
  return AI_SUGGESTIONS[key]?.[locale]
}
