import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search, X, AlertTriangle, ChevronRight } from 'lucide-react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS, getEntry, type Locale, type StringEntry } from '../lib/strings'
import { useNavigateToString, useOpenScreen } from '../hooks/useNavigateToString'
import {
  SCREEN_LABEL,
  SCREEN_ICON,
  SCREEN_ORDER,
  SCREEN_PARENT,
  ZONE_LABEL,
  ZONE_TYPE,
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
    filterMode,
    setFilterMode,
    focusPath,
    setFocusPath,
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorName,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    purchaseOpen,
    devicesOpen,
    accountOpen,
    myCharactersOpen,
    followingOpen,
    badgesOpen,
    appearanceOpen,
    settingsOpen,
    notificationSettingsOpen,
    videoSettingsOpen,
    aboutOpen,
    verifyEmailOpen,
    usernameOpen,
    deleteAccountOpen,
    characterFormOpen,
  } = useApp()
  const navigateTo = useNavigateToString()
  const openScreen = useOpenScreen()
  const [query, setQuery] = useState('')
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
    if (verifyEmailOpen) return 'verifyemail'
    if (usernameOpen) return 'username'
    if (deleteAccountOpen) return 'deleteaccount'
    if (accountOpen) return 'account'
    if (devicesOpen) return 'devices'
    if (myCharactersOpen) return 'mycharacters'
    if (followingOpen) return 'following'
    if (badgesOpen) return 'badges'
    if (appearanceOpen) return 'appearance'
    if (notificationSettingsOpen) return 'notificationsettings'
    if (videoSettingsOpen) return 'videosettings'
    if (settingsOpen) return 'settings'
    if (aboutOpen) return 'about'
    if (characterFormOpen) return 'characterform'
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
    verifyEmailOpen,
    usernameOpen,
    deleteAccountOpen,
    accountOpen,
    devicesOpen,
    myCharactersOpen,
    followingOpen,
    badgesOpen,
    appearanceOpen,
    notificationSettingsOpen,
    videoSettingsOpen,
    settingsOpen,
    aboutOpen,
    characterFormOpen,
    currentScreen,
  ])

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

  // Drill-down focus: opening a page/overlay, or a Menu/Popup group inside
  // one, or a "Unused" category, hides everything else at that level
  // so only the opened thing's strings show — not just collapsing siblings'
  // content but hiding their header rows too. Closing it (clicking the same
  // path again) pops back out and the rest reappears. A plain array works
  // as a path since only one thing can ever be drilled into at a time —
  // ['account'] focused on Kelola Akun, ['account', 'menu'] focused further
  // into just its Menu group, etc. Lives in context (not local state) so the
  // TranslationPanel's prev/next buttons can drive the same drill-down.
  // Cleared on filter/search changes since a focused path may no longer
  // even be visible under a new filter.
  function toggleFocus(path: string[]) {
    const same = focusPath.length === path.length && path.every((p, i) => focusPath[i] === p)
    setFocusPath(same ? path.slice(0, -1) : path)
  }
  useEffect(() => {
    setFocusPath([])
  }, [filterMode, query])

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
      mycharacters: {},
      following: {},
      badges: {},
      appearance: {},
      settings: {},
      notificationsettings: {},
      videosettings: {},
      about: {},
      verifyemail: {},
      username: {},
      deleteaccount: {},
      characterform: {},
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

  // Same as screenCount but honoring the active filter — used so a narrower
  // filter (Unwired / Overridden) can hide whole branches of the tree that
  // have zero matches, instead of always showing every page and overlay
  // header regardless of what's actually being filtered for.
  function screenFilteredCount(screenId: ScreenId): number {
    return Object.values(usageByScreen[screenId]).reduce((n, keys) => n + keys.filter(matchesFilter).length, 0)
  }

  // Every key NOT wired into any screen, grouped by xlsx category — the
  // "Unused" tail appended after the screen tree, since that's the
  // only way to reach content that hasn't been wired into the sandbox yet
  // without already knowing the exact text to search for.
  const unwiredCategoryGroups = useMemo(() => {
    const map = new Map<string, StringEntry[]>()
    for (const s of ALL_STRINGS) {
      if (wiredKeys.has(s.key)) continue
      const cat = String(s.category)
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [wiredKeys])

  function matchesFilter(key: string): boolean {
    if (filterMode === 'unwired') return !wiredKeys.has(key)
    // Scoped to the currently selected locale — a key overridden only in ID
    // shouldn't show as "has override" while browsing EN, since EN itself
    // was never touched and its draft box would come up empty if clicked.
    if (filterMode === 'overridden') return Boolean(overrides[key]?.[locale])
    return true
  }

  // Whether the CURRENT locale has any override yet — "Ada override" filters
  // everything down to nothing until a translator has applied at least one
  // draft for this specific locale, which otherwise looks identical to a
  // broken filter (blank category list, or screen headers with nothing
  // underneath) rather than an expected empty starting state.
  const hasAnyOverride = useMemo(
    () => Object.values(overrides).some((v) => v && v[locale]),
    [overrides, locale]
  )

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
  }, [query, filterMode, wiredKeys, overrides, locale])

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

  // A screen's own row count, ignoring anything it triggers open — the base
  // case for screenFilteredCount above.

  // A zone's own label (if not "page") + its filtered rows — reused for
  // whichever group (plain, Menu, or Popup) a zone lands in below.
  function renderZoneRows(screenId: ScreenId, zone: Zone) {
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
              key={key}
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
  }

  // Renders one page or overlay entry — header, then its own content split
  // into: plain content (the screen itself, plus any tab zones like Beli
  // MêLy Club's tabs), a Menu group (bottom-sheet zones — Opsi, Verifikasi
  // Akun, ...), and a Popup group (centered-dialog zones — confirmations,
  // edit dialogs, ...), per ZONE_TYPE. Pages and overlays are siblings now
  // (see the Pages/Overlays sections below) — an overlay no longer nests
  // under whichever page happens to open it, so every screen renders with
  // this exact same function, no recursion or ancestor-tracking needed.
  function renderEntry(screenId: ScreenId): React.ReactNode {
    const isFocused = focusPath[0] === screenId
    // Expansion is purely click-driven now — only true when this exact
    // entry is the focused one. Previously this also fell back to an
    // "auto-follow the live preview" accordion state, but that caused a
    // stale entry to silently re-expand as a side effect of navigation
    // (e.g. closing Kelola Akun navigates the live preview back to Profil,
    // which used to re-open Profil in the sidebar even though it was never
    // clicked) — collapsed should stay collapsed until explicitly opened.
    const isOpen = isFocused
    const isFiltering = filterMode !== 'all'
    const filteredTotal = screenFilteredCount(screenId)
    if (isFiltering && filteredTotal === 0) return null
    const totalCount = isFiltering ? filteredTotal : screenCount(screenId)
    const Icon = SCREEN_ICON[screenId]

    const zoneNames = Object.keys(usageByScreen[screenId])
    const plainZones = zoneNames.filter((z) => (ZONE_TYPE[z] ?? null) !== 'menu' && ZONE_TYPE[z] !== 'popup')
    const menuZones = zoneNames.filter((z) => ZONE_TYPE[z] === 'menu')
    const popupZones = zoneNames.filter((z) => ZONE_TYPE[z] === 'popup')
    const groupHasMatch = (zones: string[]) =>
      zones.some((z) => usageByScreen[screenId][z].some(matchesFilter))

    // Drilled one level further into just this entry's Menu or Popup group
    // (only meaningful while this entry itself is the focused one). The
    // three content areas — plain, Menu's rows, Popup's rows — are mutually
    // exclusive, same as the "Page / Group" tiers in the Translation panel:
    // opening a screen shows its plain content with both group headers
    // collapsed underneath; opening Menu collapses the plain content and
    // expands Menu's rows, with Popup's header still visible (just
    // collapsed) so it stays reachable without backing out first.
    const subFocus = isFocused ? focusPath[1] : undefined
    const showPlainRows = !subFocus
    const showMenuRows = subFocus === 'menu'
    const showPopupRows = subFocus === 'popup'

    return (
      <div key={screenId}>
        <button
          onClick={() => {
            headerClick(screenId)
            toggleFocus([screenId])
          }}
          className="sticky top-0 z-10 bg-imely-ink w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-white/5"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase">
            <Icon size={12} className="shrink-0" />
            {SCREEN_LABEL[screenId]} · {totalCount}
          </span>
          <ChevronRight
            size={13}
            className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {isOpen && (
          <>
            {showPlainRows && sortedZones(plainZones).map((zone) => renderZoneRows(screenId, zone))}

            {menuZones.length > 0 && groupHasMatch(menuZones) && (
              <div className="mt-1.5">
                <button
                  onClick={() => toggleFocus([screenId, 'menu'])}
                  className="w-full flex items-center justify-between px-2 hover:bg-white/5 rounded-md"
                >
                  <span className="text-[9.5px] font-bold text-imely-primary/70 uppercase tracking-wide">Menu</span>
                  <ChevronRight
                    size={11}
                    className={`text-imely-primary/70 shrink-0 transition-transform ${subFocus === 'menu' ? 'rotate-90' : ''}`}
                  />
                </button>
                {showMenuRows && sortedZones(menuZones).map((zone) => renderZoneRows(screenId, zone))}
              </div>
            )}

            {popupZones.length > 0 && groupHasMatch(popupZones) && (
              <div className="mt-1.5">
                <button
                  onClick={() => toggleFocus([screenId, 'popup'])}
                  className="w-full flex items-center justify-between px-2 hover:bg-white/5 rounded-md"
                >
                  <span className="text-[9.5px] font-bold text-imely-primary/70 uppercase tracking-wide">Popup</span>
                  <ChevronRight
                    size={11}
                    className={`text-imely-primary/70 shrink-0 transition-transform ${subFocus === 'popup' ? 'rotate-90' : ''}`}
                  />
                </button>
                {showPopupRows && sortedZones(popupZones).map((zone) => renderZoneRows(screenId, zone))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="w-[360px] shrink-0 h-full bg-imely-ink flex flex-col">
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search all 1,479 keys…"
            className="w-full text-[13px] bg-white/5 border border-white/15 text-white placeholder:text-gray-500 rounded-lg pl-8 pr-7 py-2 outline-none focus:border-imely-primary"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-2.5 text-gray-500">
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
                  : 'border-white/15 text-gray-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 mt-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${
                filterMode === f.id
                  ? 'bg-imely-primary border-imely-primary text-white'
                  : 'border-white/15 text-gray-500'
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
            <div className="text-[11px] text-gray-500 px-2 py-1">
              {flatSearchRows.length} match{flatSearchRows.length !== 1 ? 'es' : ''}
            </div>
            {searchGroups.map((group) => {
              const Icon = group.screenId ? SCREEN_ICON[group.screenId] : null
              return (
                <div key={group.screenId ?? '__unwired__'} className="mb-1">
                  <div className="sticky top-0 z-10 bg-imely-ink flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase px-2 py-1.5">
                    {Icon && <Icon size={11} className="shrink-0" />}
                    <span className="truncate">
                      {group.screenId ? SCREEN_LABEL[group.screenId] : 'Not used in any screen'}
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
        ) : filterMode === 'overridden' && !hasAnyOverride ? (
          <div className="p-5 text-center">
            <div className="text-[12.5px] text-gray-400 leading-relaxed">
              No <span className="font-semibold text-white">overrides</span> applied yet. Pick a string, type a
              draft translation in the Translation panel, then click{' '}
              <span className="font-semibold text-white">Apply</span> to create your first override.
            </div>
            <button
              onClick={() => setFilterMode('all')}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-imely-primary border border-imely-primary rounded-full px-3 py-1.5 hover:bg-imely-primary/10"
            >
              View All Strings
            </button>
          </div>
        ) : (
          <div className="p-2">
            {/* Pages and overlays render as one continuous list, in
                SCREEN_ORDER (each page immediately followed by its own
                overlays) — no separate "Pages"/"Overlays" section, since a
                translator checking strings doesn't need that distinction.
                Hidden entirely while "Unused" is the focused thing. */}
            {(focusPath.length === 0 || focusPath[0] !== '__unwired__') &&
              SCREEN_ORDER.filter((id) => focusPath.length === 0 || focusPath[0] === id).map((screenId) =>
                renderEntry(screenId)
              )}

            {filterMode !== 'all' &&
              (focusPath.length === 0 || focusPath[0] === '__unwired__') &&
              unwiredCategoryGroups.some(([, entries]) => entries.some((e) => matchesFilter(e.key))) && (
              <>
                <button
                  onClick={() => toggleFocus(['__unwired__'])}
                  className="mt-3 w-full flex items-center justify-between px-2 rounded-md hover:bg-white/5"
                >
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Unused</span>
                  <ChevronRight
                    size={11}
                    className={`text-gray-500 shrink-0 transition-transform ${focusPath[0] === '__unwired__' ? 'rotate-90' : ''}`}
                  />
                </button>
                {unwiredCategoryGroups
                  .filter(([cat]) => focusPath[0] !== '__unwired__' || !focusPath[1] || focusPath[1] === cat)
                  .map(([cat, entries]) => {
                    const filtered = entries.filter((e) => matchesFilter(e.key))
                    if (!filtered.length) return null
                    const isOpen = focusPath[0] === '__unwired__' && focusPath[1] === cat
                    return (
                      <div key={cat} className="mt-1">
                        <button
                          onClick={() => toggleFocus(['__unwired__', cat])}
                          className="sticky top-0 z-10 bg-imely-ink w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-white/5"
                        >
                          <span className="text-[11px] font-bold text-gray-400 uppercase truncate pr-2">
                            {cat} · {entries.length}
                            {filterMode === 'overridden' && (
                              <span className="text-imely-primary normal-case font-medium"> ({filtered.length} override)</span>
                            )}
                          </span>
                          <ChevronRight
                            size={13}
                            className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </button>
                        {isOpen &&
                          filtered.map((e) => (
                            <KeyRow
                              key={e.key}
                              entryKey={e.key}
                              label={localizedLabel(e)}
                              wired={false}
                              overflowing={false}
                              active={selectedKey === e.key}
                              onClick={() => navigateTo(e.key)}
                            />
                          ))}
                      </div>
                    )
                  })}
              </>
            )}
          </div>
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
        active
          ? 'bg-imely-primary text-white'
          : focused
            ? 'bg-white/10 ring-1 ring-inset ring-imely-primary'
            : 'hover:bg-white/5'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${wired ? 'bg-imely-primary' : 'bg-white/25'}`} />
      <span className={`text-[12.5px] truncate flex-1 ${active ? 'text-white' : 'text-gray-200'}`}>{label}</span>
      {overflowing && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
    </button>
  )
}
