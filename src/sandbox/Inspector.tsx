import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  Search,
  X,
  AlertTriangle,
  ChevronRight,
  Home,
  MessageCircle,
  MessageSquare,
  User,
  UserCircle,
  UserCircle2,
  Bell,
  Gem,
  History,
  ShoppingBag,
  SlidersHorizontal,
  LayoutGrid,
  Tags,
} from 'lucide-react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS, getEntry, type Locale, type StringEntry } from '../lib/strings'
import { MOCK_CHAT_THREADS, MOCK_FEED_CHARACTERS } from '../data/mockContent'

const LOCALES: { id: Locale; label: string }[] = [
  { id: 'id', label: 'ID' },
  { id: 'en', label: 'EN' },
  { id: 'vi', label: 'VI' },
]

const SCREEN_LABEL: Record<ScreenId, string> = {
  feed: 'Beranda (Feed)',
  chatlist: 'Obrolan (Chat list)',
  profile: 'Profil',
  chatdetail: 'Chat detail (overlay)',
  chatoptions: 'Opsi Chat (overlay)',
  characterprofile: 'Profil Karakter (overlay)',
  creatorprofile: 'Profil Kreator (overlay)',
  notification: 'Notifikasi (overlay)',
  gems: 'Gem (overlay)',
  gemhistory: 'Riwayat Gem (overlay)',
  purchase: 'Beli MeLy Club / Gem (overlay)',
}

const SCREEN_ICON: Record<ScreenId, typeof Home> = {
  feed: Home,
  chatlist: MessageCircle,
  profile: User,
  chatdetail: MessageSquare,
  chatoptions: SlidersHorizontal,
  characterprofile: UserCircle,
  creatorprofile: UserCircle2,
  notification: Bell,
  gems: Gem,
  gemhistory: History,
  purchase: ShoppingBag,
}

const SCREEN_ORDER: ScreenId[] = [
  'feed',
  'chatlist',
  'profile',
  'chatdetail',
  'chatoptions',
  'characterprofile',
  'creatorprofile',
  'notification',
  'gems',
  'gemhistory',
  'purchase',
]

// Display order + label for zones within a screen section. Zones not listed
// here (a screen introducing a new one later) still render, just alphabetically
// after these and labeled with their raw name.
const ZONE_ORDER = [
  'page',
  'menu',
  'gem_detail',
  'invite_input',
  'lucky_wheel',
  'lucky_result',
  'block_confirm',
  'report',
  'mode_picker',
  'relationship',
  'role_summary',
  'role_edit',
  'club',
  'gem',
]
const ZONE_LABEL: Record<string, string> = {
  page: 'Halaman',
  menu: 'Menu',
  gem_detail: 'Popup: Detail Gem',
  invite_input: 'Popup: Masukkan Kode',
  lucky_wheel: 'Popup: Roda Keberuntungan',
  lucky_result: 'Popup: Hasil Undian',
  block_confirm: 'Popup: Konfirmasi Blokir',
  report: 'Popup: Laporkan',
  mode_picker: 'Popup: Mode Obrolan',
  relationship: 'Popup: Level Kedekatan',
  role_summary: 'Popup: Ganti Peran',
  role_edit: 'Popup: Edit Peran',
  club: 'Tab: MêLy Club',
  gem: 'Tab: Gem',
}

function sortedZones(zones: string[]): string[] {
  return [...zones].sort((a, b) => {
    const ia = ZONE_ORDER.indexOf(a)
    const ib = ZONE_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

type FilterMode = 'all' | 'wired' | 'unwired' | 'overridden'

const FILTERS: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'wired', label: 'Wired' },
  { id: 'unwired', label: 'Belum wired' },
  { id: 'overridden', label: 'Ada override' },
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
    requestFocus,
    requestPopup,
    currentScreen,
    setCurrentScreen,
    overrides,
    selectedKey,
    selectedOccurrence,
    selectKey,
    activeChat,
    openChat,
    closeChat,
    chatOptionsOpen,
    openChatOptions,
    closeChatOptions,
    activeCharacterId,
    openCharacterProfile,
    closeCharacterProfile,
    activeCreatorName,
    openCreatorProfile,
    closeCreatorProfile,
    notifOpen,
    openNotif,
    closeNotif,
    gemsOpen,
    openGems,
    closeGems,
    gemHistoryOpen,
    openGemHistory,
    closeGemHistory,
    purchaseOpen,
    openPurchase,
    closePurchase,
    closeFilter,
  } = useApp()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'screens' | 'categories'>('screens')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
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
  // screen changes, open only that section and collapse the rest.
  useEffect(() => {
    setOpenScreens(new Set([activeScreenId]))
  }, [activeScreenId])

  function toggleScreen(screenId: ScreenId) {
    setOpenScreens((prev) => {
      const next = new Set(prev)
      if (next.has(screenId)) next.delete(screenId)
      else next.add(screenId)
      return next
    })
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
        jumpTo(row.key, row.screenId ?? undefined, row.zone ?? undefined)
      }
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1)
      searchInputRef.current?.blur()
    }
  }

  // Chat detail, notification, and gems are full-screen overlays toggled by
  // their own boolean in AppContext, not by currentScreen — so jumping to a
  // key that lives on one of them has to open that overlay directly, or the
  // highlighter finds nothing in the DOM and silently does nothing.
  //
  // Within a screen, a key can also live inside a popup/menu zone rather than
  // the page itself (e.g. the notification Opsi sheet, the gem detail modal).
  // Those are local component state, not AppContext booleans, so they're
  // reached via requestPopup + usePopupRequest instead of a dedicated opener
  // here. screenId/zone are passed explicitly from the per-screen accordion
  // (which knows exactly which occurrence was clicked); search results only
  // know the key, so they fall back to its first registered usage.
  function jumpTo(key: string, screenId?: ScreenId, zone?: Zone) {
    const rec = screenId ? { screenId, zone: zone ?? 'page' } : usage.find((u) => u.key === key)
    selectKey(key, rec ? { screenId: rec.screenId, zone: rec.zone } : null)
    if (rec) {
      closeChat()
      closeChatOptions()
      closeCharacterProfile()
      closeCreatorProfile()
      closeNotif()
      closeGems()
      closeGemHistory()
      closePurchase()
      closeFilter()
      if (rec.screenId === 'chatdetail') {
        const preview = MOCK_CHAT_THREADS[0]
        openChat({ id: preview.id, name: preview.name, color: preview.color })
      } else if (rec.screenId === 'chatoptions') {
        const preview = MOCK_CHAT_THREADS[0]
        openChat({ id: preview.id, name: preview.name, color: preview.color })
        openChatOptions()
      } else if (rec.screenId === 'characterprofile') {
        openCharacterProfile(MOCK_FEED_CHARACTERS[0].id)
      } else if (rec.screenId === 'creatorprofile') {
        openCharacterProfile(MOCK_FEED_CHARACTERS[0].id)
        openCreatorProfile(MOCK_FEED_CHARACTERS[0].creatorName)
      } else if (rec.screenId === 'notification') {
        openNotif()
      } else if (rec.screenId === 'gems') {
        openGems()
      } else if (rec.screenId === 'gemhistory') {
        openGems()
        openGemHistory()
      } else if (rec.screenId === 'purchase') {
        openPurchase(rec.zone === 'gem' ? 'gem' : 'club')
      } else {
        setCurrentScreen(rec.screenId)
      }
      requestPopup(rec.screenId, rec.zone)
      requestFocus(key, rec.screenId, rec.zone)
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
                        onClick={() => jumpTo(hit.key, hit.screenId ?? undefined, hit.zone ?? undefined)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : viewMode === 'screens' ? (
          SCREEN_ORDER.map((screenId) => {
            const isOpen = openScreens.has(screenId)
            const zones = sortedZones(Object.keys(usageByScreen[screenId]))
            const count = screenCount(screenId)
            const isEmpty = count === 0
            const Icon = SCREEN_ICON[screenId]
            return (
              <div key={screenId} className="p-2">
                <button
                  onClick={() => !isEmpty && toggleScreen(screenId)}
                  className={`sticky top-0 z-10 bg-white w-full flex items-center justify-between px-2 py-1 rounded-md ${
                    isEmpty ? 'opacity-40' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase">
                    <Icon size={12} className="shrink-0" />
                    {SCREEN_LABEL[screenId]} · {count}
                  </span>
                  {!isEmpty && (
                    <ChevronRight
                      size={13}
                      className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                  )}
                </button>
                {isOpen &&
                  !isEmpty &&
                  zones.map((zone) => {
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
                                selectedKey === key &&
                                selectedOccurrence?.screenId === screenId &&
                                selectedOccurrence?.zone === zone
                              }
                              onClick={() => jumpTo(key, screenId, zone)}
                            />
                          )
                        })}
                      </div>
                    )
                  })}
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
                        onClick={() => jumpTo(e.key)}
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
