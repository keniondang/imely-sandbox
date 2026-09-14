import * as XLSX from 'xlsx'
import {
  ALL_STRINGS,
  isConfirmed,
  isTargetLocale,
  LOCALE_LABEL,
  type Locale,
  type SourceLocale,
  type TargetLocale,
} from './strings'

export type ExportRowFilter = 'all' | 'untranslated' | 'needs_review' | 'translated'

// The main handoff format: Key/Category/Subcategory, the chosen reference
// (base) language's text, and the target language's translation column right
// next to it — what a translator actually needs to work a file in Excel,
// rather than a bare target-only column with nothing to translate FROM.
export function exportPairedXlsx(
  overrides: Record<string, Partial<Record<TargetLocale, string>>>,
  reviewed: Record<string, Partial<Record<TargetLocale, boolean>>>,
  baseLocale: SourceLocale,
  targetLocale: TargetLocale,
  filter: ExportRowFilter = 'all'
) {
  const header = ['Key', 'Category', 'Subcategory', LOCALE_LABEL[baseLocale], LOCALE_LABEL[targetLocale]]

  // 'translated' means confirmed (isConfirmed) — a th value pre-filled from
  // the sheet but never reviewed by a translator doesn't count as done here
  // either, same as the progress bar and filters elsewhere. 'needs_review'
  // is the row filter for exactly that in-between batch.
  const rows = ALL_STRINGS.filter((entry) => {
    if (filter === 'all') return true
    const hasText = Boolean(overrides[entry.key]?.[targetLocale])
    const confirmed = isConfirmed(entry.key, targetLocale, overrides, reviewed)
    if (filter === 'translated') return confirmed
    if (filter === 'needs_review') return hasText && !confirmed
    return !hasText
  })

  const body = rows.map((entry) => [
    entry.key,
    entry.category,
    entry.subcategory ?? '',
    entry.locales[baseLocale] ?? '',
    overrides[entry.key]?.[targetLocale] ?? '',
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body])
  worksheet['!cols'] = [{ wch: 44 }, { wch: 20 }, { wch: 18 }, { wch: 44 }, { wch: 44 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Strings')

  const date = new Date().toISOString().slice(0, 10)
  const filterSuffix = filter === 'all' ? '' : `-${filter}`
  XLSX.writeFile(workbook, `imely-strings-${baseLocale}-to-${targetLocale}${filterSuffix}-${date}.xlsx`)
}

// A single bare language column with no pairing — for pulling just one
// locale's text on its own (e.g. auditing the ID sheet, or handing off a
// source language's copy with nothing else in the file).
export function exportSingleLocaleXlsx(
  overrides: Record<string, Partial<Record<TargetLocale, string>>>,
  locale: Locale
) {
  const header = ['Key', 'Category', 'Subcategory', LOCALE_LABEL[locale]]

  const body = ALL_STRINGS.map((entry) => [
    entry.key,
    entry.category,
    entry.subcategory ?? '',
    isTargetLocale(locale) ? overrides[entry.key]?.[locale] ?? '' : entry.locales[locale] ?? '',
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body])
  worksheet['!cols'] = [{ wch: 44 }, { wch: 20 }, { wch: 18 }, { wch: 44 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Strings')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `imely-strings-${locale}-only-${date}.xlsx`)
}
