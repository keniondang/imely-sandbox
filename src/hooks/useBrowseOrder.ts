import { useMemo } from 'react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS } from '../lib/strings'
import { SCREEN_ORDER, SCREEN_LABEL, sortedZones, pageIdFor } from '../sandbox/browseConfig'

export interface BrowseRow {
  key: string
  screenId: ScreenId | null
  zone: Zone | null
}

export interface BrowseSection {
  id: string
  label: string
  startIndex: number
  endIndex: number // inclusive
}

// Same as BrowseSection but tagged with which page section it rolls up into
// — e.g. "Opsi Chat" and "Chat detail" are both their own overlaySection,
// but share the same pageId, so the panel's overlay prev/next can stay
// inside "Chat detail" while the page prev/next steps over the whole group.
export interface BrowseOverlaySection extends BrowseSection {
  pageId: string
}

// The exact same ordering the Inspector's list renders — screen-by-screen
// (zone-by-zone) in "Per Layar" mode, category-by-category in "Semua
// Kategori" mode — flattened into one array so the TranslationPanel can walk
// it with prev/next. Grouped into two tiers of sections for "screens" mode
// (a page like Gem, and the overlays nested under it like Riwayat Gem), or
// one tier for "categories" mode (there's no overlay concept there, so
// pageSections and overlaySections are the same list). Lives in its own hook
// (rather than inside Inspector) so both sides of the screen compute
// identical results from the same shared viewMode/filterMode in context.
export function useBrowseOrder(): {
  rows: BrowseRow[]
  pageSections: BrowseSection[]
  overlaySections: BrowseOverlaySection[]
} {
  const { usage, overrides, viewMode, filterMode } = useApp()

  const wiredKeys = useMemo(() => new Set(usage.map((u) => u.key)), [usage])

  return useMemo(() => {
    function matchesFilter(key: string): boolean {
      if (filterMode === 'wired') return wiredKeys.has(key)
      if (filterMode === 'unwired') return !wiredKeys.has(key)
      if (filterMode === 'overridden') return Boolean(overrides[key] && Object.keys(overrides[key]).length > 0)
      return true
    }

    const rows: BrowseRow[] = []
    const pageSections: BrowseSection[] = []
    const overlaySections: BrowseOverlaySection[] = []

    if (viewMode === 'screens') {
      const usageByScreen: Partial<Record<ScreenId, Record<string, string[]>>> = {}
      usage.forEach((u) => {
        const zoneMap = (usageByScreen[u.screenId] ??= {})
        const keys = (zoneMap[u.zone] ??= [])
        if (!keys.includes(u.key)) keys.push(u.key)
      })

      for (const screenId of SCREEN_ORDER) {
        const zoneMap = usageByScreen[screenId] ?? {}
        const start = rows.length
        for (const zone of sortedZones(Object.keys(zoneMap))) {
          for (const key of zoneMap[zone]) {
            if (!matchesFilter(key)) continue
            rows.push({ key, screenId, zone })
          }
        }
        if (rows.length === start) continue

        const overlaySection: BrowseOverlaySection = {
          id: screenId,
          label: SCREEN_LABEL[screenId],
          startIndex: start,
          endIndex: rows.length - 1,
          pageId: pageIdFor(screenId),
        }
        overlaySections.push(overlaySection)

        // SCREEN_ORDER puts each parent immediately before its children, so
        // sections sharing a pageId are always contiguous — just extend the
        // running page section instead of starting a new one.
        const lastPage = pageSections[pageSections.length - 1]
        if (lastPage && lastPage.id === overlaySection.pageId) {
          lastPage.endIndex = overlaySection.endIndex
        } else {
          pageSections.push({
            id: overlaySection.pageId,
            label: SCREEN_LABEL[overlaySection.pageId as ScreenId],
            startIndex: overlaySection.startIndex,
            endIndex: overlaySection.endIndex,
          })
        }
      }
    } else {
      const byCategory = new Map<string, typeof ALL_STRINGS>()
      for (const s of ALL_STRINGS) {
        const cat = String(s.category)
        if (!byCategory.has(cat)) byCategory.set(cat, [])
        byCategory.get(cat)!.push(s)
      }
      const catNames = [...byCategory.keys()].sort((a, b) => a.localeCompare(b))

      for (const cat of catNames) {
        const start = rows.length
        for (const entry of byCategory.get(cat)!) {
          if (!matchesFilter(entry.key)) continue
          const occ = usage.find((u) => u.key === entry.key)
          rows.push({ key: entry.key, screenId: occ?.screenId ?? null, zone: occ?.zone ?? null })
        }
        if (rows.length === start) continue
        // No overlay concept in category browsing — a category is its own
        // page AND its own (single) overlay section.
        pageSections.push({ id: cat, label: cat, startIndex: start, endIndex: rows.length - 1 })
        overlaySections.push({ id: cat, label: cat, startIndex: start, endIndex: rows.length - 1, pageId: cat })
      }
    }

    return { rows, pageSections, overlaySections }
  }, [usage, overrides, viewMode, filterMode, wiredKeys])
}
