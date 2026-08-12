import rawStrings from '../data/strings.json'

export type Locale = 'id' | 'en' | 'vi'

export interface StringEntry {
  key: string
  category: string
  subcategory: string | null
  locales: Record<Locale, string>
}

export const ALL_STRINGS = rawStrings as StringEntry[]

const BY_KEY = new Map<string, StringEntry>(ALL_STRINGS.map((s) => [s.key, s]))

export function getEntry(key: string): StringEntry | undefined {
  return BY_KEY.get(key)
}

// Resolve a key -> localized text, with ${LAZY_DATA(x)} tokens swapped
// for placeholder mock values passed in `vars`.
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
