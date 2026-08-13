import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search, X, AlertTriangle, ChevronRight, LayoutGrid, Tags } from 'lucide-react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS, getEntry, type Locale, type StringEntry } from '../lib/strings'
import { useNavigateToString, useOpenScreen } from '../hooks/useNavigateToString'
import {
  SCREEN_LABEL,
  SCREEN_ICON,
  SCREEN_ORDER,
  PAGE_ORDER,
  PAGE_CHILDREN,
  SCREEN_PARENT,
  CHILD_SCREENS,
  ZONE_LABEL,
  sortedZones,
  pageIdFor,
  FILTERS,
} from './browseConfig'

const LOCALES: { id: Locale; label: string }[] = [
  { id: 'id', label: 'ID' },
  { id: 'en', label: 'EN' },
  { id: 'vi', label: 'VI' },
]

interface SearchHit {
  key: string
  screenId: ScreenId | null
  zone: Zone | null
}

export function Inspector() {
  const {
    locale,
    setLocale,
    usage,
    currentScreen,
    overrides,
    selectedKey,
    selectedOccurrence,
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorName,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    purchaseOpen,
  } = useApp()
  const navigateTo = useNavigateToString()
  const openScreen = useOpenScreen()
  const [query, setQuery] = useState('')
  const [openScreens, setOpenScreens] = useState<Set<ScreenId>>(() => new Set(['feed']))
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  // Composite `key::screenId::zone` strings currently overflowing their
  // container, re-scanned on an interval — see the bulk-scan effect below.
  const [overflowingKeys, setOverflowingKeys] = useState<Set<string>>(new Set())
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef(new Map<number, HTMLButtonElement>())

  // Whichever screen is actually visible in the live preview right now —
  // base screens track currentScreen, but overlays (chat detail, notification,
  // gems) render independently of it, so check those booleans first.
  const activeScreenId: ScreenId = useMemo(() => {
    if (activeChat && chatOptionsOpen) return 'chatoptions'
    if (activeChat) return 'chatdetail'
    if (activeCharacterId && activeCreatorName) return 'creatorprofile'
    if (activeCharacterId) return 'characterprofile'
    if (notifOpen) return 'notification'
    if (purchaseOpen) return 'purchase'
    if (gemHistoryOpen) return 'gemhistory'
    if (gemsOpen) return 'gems'
    return currentScreen
  }, [
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorName,
    notifOpen,
    purchaseOpen,
    gemHistoryOpen,
    gemsOpen,
    currentScreen,
  ])

  // Keep the accordion in sync with the live preview: whenever the visible
  // screen changes, open its full ancestor chain (base page, and its overlay
  // parent too if it's nested 2 deep like Opsi Chat) and collapse the rest.
  useEffect(() => {
    const chain = new Set<ScreenId>([activeScreenId, pageIdFor(activeScreenId)])
    const parent = SCREEN_PARENT[activeScreenId]
    if (parent) chain.add(parent)
    setOpenScreens(chain)
  }, [activeScreenId])

  // A section header both opens its screen in the live preview AND expands
  // the tree to it. If it's already the one showing, clicking it again
  // closes it instead — one level back up (Riwayat Gem -> Gem -> Beranda) —
  // rather than being a no-op, since there was previously no way to close an
  // overlay from the Inspector at all.
  function headerClick(screenId: ScreenId) {
    if (activeScreenId !== screenId) {
      openScreen(screenId)
      return
    }
    const back = SCREEN_PARENT[screenId] ?? pageIdFor(screenId)
    if (back !== screenId) openScreen(back)
  }

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const wiredKeys = useMemo(() => new Set(usage.map((u) => u.key)), [usage])

  // screenId -> zone -> keys in that zone. The same key can legitimately
  // appear in more than one zone on a screen (e.g. a gem total shown on both
  // the page and inside a detail popup) — each occurrence is jumpable on its own.
  const usageByScreen = useMemo(() => {
    const map: Record<ScreenId, Record<string, string[]>> = {
      feed: {},
      chatlist: {},
      profile: {},
      chatdetail: {},
      chatoptions: {},
      characterprofile: {},
      creatorprofile: {},
      notification: {},
      gems: {},
      gemhistory: {},
      purchase: {},
      devices: {},
      account: {},
    }
    usage.forEach((u) => {
      const zoneMap = map[u.screenId]
      if (!zoneMap[u.zone]) zoneMap[u.zone] = []
      if (!zoneMap[u.zone].includes(u.key)) zoneMap[u.zone].push(u.key)
    })
    return map
  }, [usage])

  function screenCount(screenId: ScreenId): number {
    return Object.values(usageByScreen[screenId]).reduce((n, keys) => n + keys.length, 0)
  }

  // All 1,479 keys grouped by their xlsx category, for "Semua Kategori" browsing —
  // most of them aren't wired into any screen yet, so this is the only way to
  // reach them without already knowing the exact text to search for.
  const categoryGroups = useMemo(() => {
    const map = new Map<string, StringEntry[]>()
    for (const s of ALL_STRINGS) {
      const cat = String(s.category)
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [])

  function matchesFilter(key: string): boolean {
    if (filterMode === 'wired') return wiredKeys.has(key)
    if (filterMode === 'unwired') return !wiredKeys.has(key)
    if (filterMode === 'overridden') return Boolean(overrides[key] && Object.keys(overrides[key]).length > 0)
    return true
  }

  // Prefer whichever locale is selected in the pills above, so the list
  // matches what the live preview is actually showing right now.
  function localizedLabel(entry: { locales: Record<Locale, string> }): string {
    return entry.locales[locale] || entry.locales.id || entry.locales.en || ''
  }

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_STRINGS.filter(
      (s) =>
        (s.key.toLowerCase().includes(q) ||
          String(s.category).toLowerCase().includes(q) ||
          s.locales.id?.toLowerCase().includes(q) ||
          s.locales.en?.toLowerCase().includes(q) ||
          s.locales.vi?.toLowerCase().includes(q)) &&
        matchesFilter(s.key)
    ).slice(0, 80)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterMode, wiredKeys, overrides])

  // Search results grouped by which screen(s) actually render them — a key
  // wired into 3 places shows up under all 3, keys never wired land in a
  // trailing "not used anywhere" bucket. Scanning 60+ flat results for one
  // term is hard to read; grouping mirrors how you'd actually go find it.
  const searchGroups = useMemo(() => {
    if (!query.trim()) return [] as { screenId: ScreenId | null; hits: SearchHit[] }[]
    const groups = new Map<ScreenId | null, SearchHit[]>()
    for (const s of searchResults) {
      const occurrences = usage.filter((u) => u.key === s.key)
      if (occurrences.length === 0) {
        const arr = groups.get(null) ?? []
        arr.push({ key: s.key, screenId: null, zone: null })
        groups.set(null, arr)
      } else {
        for (const occ of occurrences) {
          const arr = groups.get(occ.screenId) ?? []
          arr.push({ key: s.key, screenId: occ.screenId, zone: occ.zone })
          groups.set(occ.screenId, arr)
        }
      }
    }
    const ordered: { screenId: ScreenId | null; hits: SearchHit[] }[] = []
    for (const screenId of SCREEN_ORDER) {
      const hits = groups.get(screenId)
      if (hits) ordered.push({ screenId, hits })
    }
    const unwired = groups.get(null)
    if (unwired) ordered.push({ screenId: null, hits: unwired })
    return ordered
  }, [searchResults, usage, query])

  const flatSearchRows = useMemo(() => searchGroups.flatMap((g) => g.hits), [searchGroups])
  const searchRowIndex = useMemo(() => {
    const m = new Map<SearchHit, number>()
    flatSearchRows.forEach((h, i) => m.set(h, i))
    return m
  }, [flatSearchRows])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [query])

  useEffect(() => {
    if (focusedIndex < 0) return
    rowRefs.current.get(focusedIndex)?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!flatSearchRows.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, flatSearchRows.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const row = flatSearchRows[focusedIndex] ?? flatSearchRows[0]
      if (row) {
        e.preventDefault()
        navigateTo(row.key, row.screenId ?? undefined, row.zone ?? undefined)
      }
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1)
      searchInputRef.current?.blur()
    }
  }

  // Bulk overflow scan — re-checks every <Str> currently mounted in the live
  // preview (whatever screen/popup happens to be open) on a short interval,
  // so the list can flag overflowing strings without clicking each one.
  useEffect(() => {
    function scan() {
      const els = document.querySelectorAll<HTMLElement>('[data-str-key]')
      const next = new Set<string>()
      els.forEach((el) => {
        const k = el.getAttribute('data-str-key')
        if (!k) return
        const s = el.getAttribute('data-str-screen') ?? ''
        const z = el.getAttribute('data-str-zone') ?? ''
        if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) {
          next.add(`${k}::${s}::${z}`)
        }
      })
      setOverflowingKeys(next)
    }
    scan()
    const id = setInterval(scan, 1200)
    return () => clearInterval(id)
  }, [])

  function isOverflowing(key: string, screenId?: ScreenId | null, zone?: Zone | null): boolean {
    if (!screenId) return false
    return overflowingKeys.has(`${key}::${screenId}::${zone ?? 'page'}`)
  }

  // Shared by all 3 accordion levels (page / primary overlay / nested
  // overlay) — a screen's own zones + keys, zone-grouped and filtered.
  function renderScreenRows(screenId: ScreenId) {
    return sortedZones(Object.keys(usageByScreen[screenId])).map((zone) => {
      const keys = usageByScreen[screenId][zone].filter(matchesFilter)
      if (!keys.length) return null
      return (
        <div key={zone} className="mt-0.5">
          {zone !== 'page' && (
            <div className="text-[10px] font-semibold text-gray-400 uppercase px-2 pt-2 pb-0.5">
              {ZONE_LABEL[zone] ?? zone}
            </div>
          )}
          {keys.map((key) => {
            const e = getEntry(key)
            return (
              <KeyRow
                key={`${zone}-${key}`}
                entryKey={key}
                label={e ? localizedLabel(e) : key}
                wired
                overflowing={isOverflowing(key, screenId, zone)}
                active={
                  selectedKey === key && selectedOccurrence?.screenId === screenId && selectedOccurrence?.zone === zone
                }
                onClick={() => navigateTo(key, screenId, zone)}
              />
            )
          })}
        </div>
      )
    })
  }

  return (
    <div className="w-[360px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col">
      <div className="p-3 border-b border-imely-line">
        <div className="font-bold text-sm text-imely-ink mb-2">String Inspector</div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search all 1,479 keys…"
            className="w-full text-[13px] border border-imely-line rounded-lg pl-8 pr-7 py-2 outline-none focus:border-imely-primary"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-2.5 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 mt-2">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLocale(l.id)}
              className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border ${
                locale === l.id
                  ? 'bg-imely-primary text-white border-imely-primary'
                  : 'border-imely-line text-gray-500'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {!query.trim() && (
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => setViewMode('screens')}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                viewMode === 'screens'
                  ? 'bg-imely-ink text-white border-imely-ink'
                  : 'border-imely-line text-gray-500'
              }`}
            >
              <LayoutGrid size={11} /> Per Layar
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                viewMode === 'categories'
                  ? 'bg-imely-ink text-white border-imely-ink'
                  : 'border-imely-line text-gray-500'
              }`}
            >
              <Tags size={11} /> Semua Kategori
            </button>
          </div>
        )}

        <div className="flex gap-1.5 mt-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${
                filterMode === f.id
                  ? 'bg-imely-mint border-imely-primary text-imely-primaryDark'
                  : 'border-imely-line text-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          <div className="p-2">
            <div className="text-[11px] text-gray-400 px-2 py-1">
              {flatSearchRows.length} match{flatSearchRows.length !== 1 ? 'es' : ''}
            </div>
            {searchGroups.map((group) => {
              const Icon = group.screenId ? SCREEN_ICON[group.screenId] : null
              return (
                <div key={group.screenId ?? '__unwired__'} className="mb-1">
                  <div className="sticky top-0 z-10 bg-white flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase px-2 py-1.5">
                    {Icon && <Icon size={11} className="shrink-0" />}
                    <span className="truncate">
                      {group.screenId ? SCREEN_LABEL[group.screenId] : 'Belum digunakan di layar manapun'}
                    </span>
                  </div>
                  {group.hits.map((hit) => {
                    const e = getEntry(hit.key)
                    const idx = searchRowIndex.get(hit)!
                    return (
                      <KeyRow
                        key={`${group.screenId ?? 'unwired'}-${hit.zone ?? ''}-${hit.key}`}
                        rowRef={(el) => {
                          if (el) rowRefs.current.set(idx, el)
                          else rowRefs.current.delete(idx)
                        }}
                        entryKey={hit.key}
                        label={e ? localizedLabel(e) : hit.key}
                        wired={wiredKeys.has(hit.key)}
                        overflowing={isOverflowing(hit.key, hit.screenId, hit.zone)}
                        active={
                          selectedKey === hit.key &&
                          selectedOccurrence?.screenId === hit.screenId &&
                          selectedOccurrence?.zone === (hit.zone ?? 'page')
                        }
                        focused={idx === focusedIndex}
                        onClick={() => navigateTo(hit.key, hit.screenId ?? undefined, hit.zone ?? undefined)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : viewMode === 'screens' ? (
          PAGE_ORDER.map((pageId) => {
            const isOpen = openScreens.has(pageId)
            const primaryOverlays = PAGE_CHILDREN[pageId] ?? []
            const totalCount =
              screenCount(pageId) +
              primaryOverlays.reduce(
                (n, o) => n + screenCount(o) + (CHILD_SCREENS[o] ?? []).reduce((n2, c) => n2 + screenCount(c), 0),
                0
              )
            const Icon = SCREEN_ICON[pageId]
            return (
              <div key={pageId} className="p-2">
                {/* Always clickable — even at 0 keys, so a page's overlays (Gem,
                    Chat detail, ...) are reachable from the sidebar without
                    first opening them by hand in the live preview. */}
                <button
                  onClick={() => headerClick(pageId)}
                  className="sticky top-0 z-10 bg-white w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-gray-50"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase">
                    <Icon size={12} className="shrink-0" />
                    {SCREEN_LABEL[pageId]} · {totalCount}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                {isOpen && (
                  <>
                    {renderScreenRows(pageId)}

                    {primaryOverlays.map((overlayId) => {
                      const overlayOpen = openScreens.has(overlayId)
                      const grandchildren = CHILD_SCREENS[overlayId] ?? []
                      const overlayTotal =
                        screenCount(overlayId) + grandchildren.reduce((n, c) => n + screenCount(c), 0)
                      const OverlayIcon = SCREEN_ICON[overlayId]
                      return (
                        <div key={overlayId} className="mt-1.5 ml-2.5 border-l border-imely-line pl-2">
                          <button
                            onClick={() => headerClick(overlayId)}
                            className="sticky top-0 z-10 bg-white w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-400 uppercase">
                              <OverlayIcon size={11} className="shrink-0" />
                              {SCREEN_LABEL[overlayId]} · {overlayTotal}
                            </span>
                            <ChevronRight
                              size={12}
                              className={`text-gray-400 shrink-0 transition-transform ${overlayOpen ? 'rotate-90' : ''}`}
                            />
                          </button>
                          {overlayOpen && (
                            <>
                              {renderScreenRows(overlayId)}

                              {grandchildren.map((childId) => {
                                const childOpen = openScreens.has(childId)
                                const childCount = screenCount(childId)
                                const ChildIcon = SCREEN_ICON[childId]
                                return (
                                  <div key={childId} className="mt-1.5 ml-2.5 border-l border-imely-line pl-2">
                                    <button
                                      onClick={() => headerClick(childId)}
                                      className="sticky top-0 z-10 bg-white w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-gray-50"
                                    >
                                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                        <ChildIcon size={10} className="shrink-0" />
                                        {SCREEN_LABEL[childId]} · {childCount}
                                      </span>
                                      <ChevronRight
                                        size={11}
                                        className={`text-gray-400 shrink-0 transition-transform ${childOpen ? 'rotate-90' : ''}`}
                                      />
                                    </button>
                                    {childOpen && renderScreenRows(childId)}
                                  </div>
                                )
                              })}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )
          })
        ) : (
          categoryGroups.map(([cat, entries]) => {
            const filtered = entries.filter((e) => matchesFilter(e.key))
            if (!filtered.length) return null
            const isOpen = openCategories.has(cat)
            const wiredCount = entries.filter((e) => wiredKeys.has(e.key)).length
            return (
              <div key={cat} className="p-2">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="sticky top-0 z-10 bg-white w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-gray-50"
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase truncate pr-2">
                    {cat} · {entries.length}{' '}
                    <span className="text-imely-primary normal-case font-medium">({wiredCount} wired)</span>
                  </span>
                  <ChevronRight
                    size={13}
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                {isOpen &&
                  filtered.map((e) => {
                    const occ = usage.find((u) => u.key === e.key)
                    return (
                      <KeyRow
                        key={e.key}
                        entryKey={e.key}
                        label={localizedLabel(e)}
                        wired={wiredKeys.has(e.key)}
                        overflowing={isOverflowing(e.key, occ?.screenId, occ?.zone)}
                        active={selectedKey === e.key}
                        onClick={() => navigateTo(e.key)}
                      />
                    )
                  })}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function KeyRow({
  entryKey,
  label,
  wired,
  active,
  focused,
  overflowing,
  onClick,
  rowRef,
}: {
  entryKey: string
  label?: string
  wired: boolean
  active: boolean
  focused?: boolean
  overflowing?: boolean
  onClick: () => void
  rowRef?: (el: HTMLButtonElement | null) => void
}) {
  return (
    <button
      ref={rowRef}
      onClick={onClick}
      title={entryKey}
      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${
        active ? 'bg-imely-mint' : focused ? 'bg-gray-100 ring-1 ring-inset ring-imely-primary' : 'hover:bg-gray-50'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${wired ? 'bg-imely-primary' : 'bg-gray-300'}`} />
      <span className="text-[12.5px] text-imely-ink truncate flex-1">{label}</span>
      {overflowing && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
    </button>
  )
}
