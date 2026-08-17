// Regenerates src/data/strings.json and src/data/zhTwBaseline.json from
// source-data/strings.xlsx. Reusable — drop in an updated spreadsheet and
// re-run `npm run import-strings` any time the source sheet changes.
//
// Sheet layout (as of the 2172026 sheet): 2 blank rows, then a header row,
// then data. Category and Sub cate use merged cells in the spreadsheet, so
// only the first row of each group has a value — everything below it reads
// as blank until the next explicit value, which this script forward-fills.
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC_XLSX = path.join(ROOT, 'source-data', 'strings.xlsx')
const OUT_STRINGS = path.join(ROOT, 'src', 'data', 'strings.json')
const OUT_ZH_BASELINE = path.join(ROOT, 'src', 'data', 'zhTwBaseline.json')
const SHEET_NAME = '2172026'

if (!fs.existsSync(SRC_XLSX)) {
  console.error(`No spreadsheet found at ${SRC_XLSX}`)
  process.exit(1)
}

const workbook = XLSX.readFile(SRC_XLSX)
const worksheet = workbook.Sheets[SHEET_NAME]
if (!worksheet) {
  console.error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`)
  process.exit(1)
}

const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
// rows[0..1] are blank, rows[2] is the header (STT/Category/Sub cate/Key/
// Vie/Eng/Indo/zh-TW/Owner/Note/Preview) — real data starts at rows[3].
const data = rows.slice(3)

const strings = []
const zhTwBaseline = {}
const seenKeys = new Set()
let lastCategory = ''
let lastSubcat = null
let skippedNoKey = 0
let skippedDupe = 0

for (const row of data) {
  if (!row || row.length === 0) continue
  const [, catCell, subCell, key, vi, en, id, zh] = row

  // Merged cells: a new category resets the tracked subcategory to
  // whatever (if anything) that same row specifies, so a subcategory never
  // bleeds across a category boundary; a new subcategory within the same
  // category just updates the tracker.
  if (catCell) {
    lastCategory = String(catCell)
    lastSubcat = subCell ? String(subCell) : null
  } else if (subCell) {
    lastSubcat = String(subCell)
  }

  if (!key) {
    skippedNoKey++
    continue
  }
  const keyStr = String(key)
  if (seenKeys.has(keyStr)) {
    skippedDupe++
    console.warn(`Duplicate key skipped: ${keyStr}`)
    continue
  }
  seenKeys.add(keyStr)

  const locales = {}
  if (id) locales.id = String(id)
  if (en) locales.en = String(en)
  if (vi) locales.vi = String(vi)

  strings.push({
    key: keyStr,
    category: lastCategory || 'Uncategorized',
    subcategory: lastSubcat,
    locales,
  })

  if (zh) zhTwBaseline[keyStr] = String(zh)
}

fs.writeFileSync(OUT_STRINGS, JSON.stringify(strings, null, 2) + '\n')
fs.writeFileSync(OUT_ZH_BASELINE, JSON.stringify(zhTwBaseline, null, 2) + '\n')

console.log(`Imported ${strings.length} strings from "${SHEET_NAME}".`)
console.log(`  skipped ${skippedNoKey} non-blank rows with no key, ${skippedDupe} duplicate keys.`)
console.log(`  zh-TW baseline: ${Object.keys(zhTwBaseline).length} / ${strings.length} keys already have a translation in the sheet.`)
