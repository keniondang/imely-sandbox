import { useMemo } from 'react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS } from '../lib/strings'
import { SCREEN_ORDER, SCREEN_LABEL, ZONE_TYPE, sortedZones } from '../sandbox/browseConfig'

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
// — e.g. Kelola Akun's Menu group and Popup group are both their own
// overlaySection, but share pageId 'account', so the panel's Menu/Popup
// prev/next can step between them while page prev/next steps over the
// whole screen at once.
export interface BrowseOverlaySection extends BrowseSection {
  pageId: string
}

// The exact same ordering the Inspector's tree renders: every screen in
// SCREEN_ORDER (each its own "page" section — pages and overlays are flat
// siblings now, not nested; tier 1 only ever steps between these), followed
// by a trailing "Unused" tail — every xlsx key not wired into any screen,
// grouped by category. Within a screen, its own plain content and any
// Menu-type / Popup-type zones each form their own contiguous block and
// their own "overlay" section (tier 2) — mirroring exactly how the
// Inspector groups a screen's content, so the panel's second-tier prev/next
// steps between the SAME Page/Menu/Popup groups the sidebar shows (tier 1
// stays focused purely on which screen, tier 2 handles moving around within
// one). A screen with no Menu/Popup zones just has a single tier-2 stop
// (its own content), and a category in "Unused" has none at all, so the
// buttons disable rather than jumping to an unrelated screen.
// Flattened into one array. Lives in its own hook (rather than inside
// Inspector) so both sides of the screen compute identical results from
// the same shared filterMode in context.
export function useBrowseOrder(): {
  rows: BrowseRow[]
  pageSections: BrowseSection[]
  overlaySections: BrowseOverlaySection[]
} {
  const { usage, overrides, filterMode, locale } = useApp()

  const wiredKeys = useMemo(() => new Set(usage.map((u) => u.key)), [usage])

  return useMemo(() => {
    // Must mirror the Inspector's own matchesFilter exactly (same locale
    // scoping, same 'untranslated' branch) — the panel's Prev/Next walks
    // THESE rows, so any divergence means it could land on a string the
    // Inspector's filtered list doesn't show, or skip over one it does.
    function matchesFilter(key: string): boolean {
      if (filterMode === 'unwired') return !wiredKeys.has(key)
      if (filterMode === 'overridden') return Boolean(overrides[key]?.[locale])
      if (filterMode === 'untranslated') return !overrides[key]?.[locale]
      return true
    }

    const rows: BrowseRow[] = []
    const pageSections: BrowseSection[] = []
    const overlaySections: BrowseOverlaySection[] = []

    const usageByScreen: Partial<Record<ScreenId, Record<string, string[]>>> = {}
    usage.forEach((u) => {
      const zoneMap = (usageByScreen[u.screenId] ??= {})
      const keys = (zoneMap[u.zone] ??= [])
      if (!keys.includes(u.key)) keys.push(u.key)
    })

    for (const screenId of SCREEN_ORDER) {
      const zoneMap = usageByScreen[screenId] ?? {}
      const zoneNames = Object.keys(zoneMap)
      const plainZones = zoneNames.filter((z) => ZONE_TYPE[z] !== 'menu' && ZONE_TYPE[z] !== 'popup')
      const menuZones = zoneNames.filter((z) => ZONE_TYPE[z] === 'menu')
      const popupZones = zoneNames.filter((z) => ZONE_TYPE[z] === 'popup')

      const pageStart = rows.length

      for (const zone of sortedZones(plainZones)) {
        for (const key of zoneMap[zone]) {
          if (!matchesFilter(key)) continue
          rows.push({ key, screenId, zone })
        }
      }
      // The screen's own plain content is a tier-2 stop too, same as Menu
      // and Popup — otherwise there'd be no way to step back to it from
      // Menu/Popup via the Group buttons once you've moved past it, only by
      // jumping whole screens (tier 1) or crawling one string at a time.
      if (rows.length > pageStart) {
        overlaySections.push({
          id: `${screenId}:page`,
          label: 'Page',
          startIndex: pageStart,
          endIndex: rows.length - 1,
          pageId: screenId,
        })
      }

      const menuStart = rows.length
      for (const zone of sortedZones(menuZones)) {
        for (const key of zoneMap[zone]) {
          if (!matchesFilter(key)) continue
          rows.push({ key, screenId, zone })
        }
      }
      if (rows.length > menuStart) {
        overlaySections.push({
          id: `${screenId}:menu`,
          label: 'Menu',
          startIndex: menuStart,
          endIndex: rows.length - 1,
          pageId: screenId,
        })
      }

      const popupStart = rows.length
      for (const zone of sortedZones(popupZones)) {
        for (const key of zoneMap[zone]) {
          if (!matchesFilter(key)) continue
          rows.push({ key, screenId, zone })
        }
      }
      if (rows.length > popupStart) {
        overlaySections.push({
          id: `${screenId}:popup`,
          label: 'Popup',
          startIndex: popupStart,
          endIndex: rows.length - 1,
          pageId: screenId,
        })
      }

      if (rows.length === pageStart) continue
      pageSections.push({ id: screenId, label: SCREEN_LABEL[screenId], startIndex: pageStart, endIndex: rows.length - 1 })
    }

    // "Unused" tail — every key not wired into any screen, grouped by xlsx
    // category. No Menu/Popup concept here, so no tier-2 sections — just a
    // flat page section per category, same as a screen with neither.
    const byCategory = new Map<string, typeof ALL_STRINGS>()
    for (const s of ALL_STRINGS) {
      if (wiredKeys.has(s.key)) continue
      const cat = String(s.category)
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(s)
    }
    const catNames = [...byCategory.keys()].sort((a, b) => a.localeCompare(b))

    for (const cat of catNames) {
      const start = rows.length
      for (const entry of byCategory.get(cat)!) {
        if (!matchesFilter(entry.key)) continue
        rows.push({ key: entry.key, screenId: null, zone: null })
      }
      if (rows.length === start) continue
      pageSections.push({ id: `unwired:${cat}`, label: cat, startIndex: start, endIndex: rows.length - 1 })
    }

    return { rows, pageSections, overlaySections }
  }, [usage, overrides, filterMode, wiredKeys, locale])
}
