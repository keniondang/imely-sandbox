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

export interface StringEntry {
  key: string
  category: string
  subcategory: string | null
  // Only ever populated for the 3 source locales — target locales have no
  // sheet data, hence `Partial` rather than `Record<Locale, string>`.
  locales: Partial<Record<Locale, string>>
}

export const ALL_STRINGS = rawStrings as StringEntry[]

const BY_KEY = new Map<string, StringEntry>(ALL_STRINGS.map((s) => [s.key, s]))

export function getEntry(key: string): StringEntry | undefined {
  return BY_KEY.get(key)
}

// Resolve a key -> localized text, with ${LAZY_DATA(x)} tokens swapped
// for placeholder mock values passed in `vars`. Falls back through en/id
// when the requested locale (including target locales, which never have
// sheet data) has nothing — the live preview should still show SOMETHING
// rather than a blank string while a translation is still in progress.
export function resolveString(
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>
): string {
  const entry = BY_KEY.get(key)
  if (!entry) return `⚠ missing:${key}`

  let text = entry.locales[locale] || entry.locales.en || entry.locales.id || ''

  if (vars) {
    text = text.replace(/\$\{LAZY_DATA\(([^)]+)\)\}/g, (_, varName) => {
      const v = vars[varName]
      return v !== undefined ? String(v) : `{${varName}}`
    })
  }
  return text
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

export function getAiSuggestion(key: string, locale: Locale): string | undefined {
  if (!isTargetLocale(locale)) return undefined
  return AI_SUGGESTIONS[key]?.[locale]
}
