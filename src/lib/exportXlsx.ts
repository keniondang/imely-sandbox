import * as XLSX from 'xlsx'
import { ALL_STRINGS, isTargetLocale, LOCALE_LABEL, type Locale, type TargetLocale } from './strings'

// One language per export — Key/Category/Subcategory plus a single
// translation column, rather than every locale bundled into one wide sheet.
// A translator handing off just the TH (or just the EN) column doesn't want
// 4 other languages' worth of noise in the file.
export function exportStringsToXlsx(
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
  XLSX.writeFile(workbook, `imely-strings-${locale}-${date}.xlsx`)
}
