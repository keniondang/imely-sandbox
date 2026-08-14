import * as XLSX from 'xlsx'
import { ALL_STRINGS, LOCALE_LABEL, SOURCE_LOCALES, TARGET_LOCALES, type Locale } from './strings'

// One-sheet handoff: every key from the source spreadsheet, its original
// id/en/vi columns untouched, plus a zh-TW and th column filled from
// whatever's been translated in this tool so far (blank where still
// untranslated). Re-exportable any time — always a full, current snapshot
// rather than a diff — so a translator (or us) can just grab the latest
// file instead of reconciling partial exports.
export function exportStringsToXlsx(overrides: Record<string, Partial<Record<Locale, string>>>) {
  const localeCols = [...SOURCE_LOCALES, ...TARGET_LOCALES]
  const header = ['Key', 'Category', 'Subcategory', ...localeCols.map((l) => LOCALE_LABEL[l])]

  const body = ALL_STRINGS.map((entry) => [
    entry.key,
    entry.category,
    entry.subcategory ?? '',
    ...SOURCE_LOCALES.map((l) => entry.locales[l] ?? ''),
    ...TARGET_LOCALES.map((l) => overrides[entry.key]?.[l] ?? ''),
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body])
  worksheet['!cols'] = [{ wch: 44 }, { wch: 20 }, { wch: 18 }, ...localeCols.map(() => ({ wch: 36 }))]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Strings')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `imely-strings-${date}.xlsx`)
}
