import { useEffect, useMemo, useState } from 'react'
import { Search, X, AlertTriangle, RotateCcw, ChevronRight } from 'lucide-react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { ALL_STRINGS, getEntry, type Locale } from '../lib/strings'
import { MOCK_CHAT_THREADS, MOCK_FEED_CHARACTERS } from '../data/mockContent'
import { buildStrSelector } from '../components/Str'

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
  notification: 'Notifikasi (overlay)',
  gems: 'Gem (overlay)',
  gemhistory: 'Riwayat Gem (overlay)',
  purchase: 'Beli MeLy Club / Gem (overlay)',
  characterprofile: 'Profil Karakter (overlay)',
  creatorprofile: 'Profil Kreator (overlay)',
}

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
    setOverride,
    activeChat,
    openChat,
    closeChat,
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
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  // Which exact occurrence of selectedKey is showing in the detail panel —
  // null when the key isn't wired anywhere. Needed alongside selectedKey
  // because the same key can render in more than one screen/zone.
  const [selectedOccurrence, setSelectedOccurrence] = useState<{ screenId: ScreenId; zone: Zone } | null>(null)
  const [overflowFlag, setOverflowFlag] = useState<boolean | null>(null)
  const [openScreens, setOpenScreens] = useState<Set<ScreenId>>(() => new Set(['feed']))

  // Whichever screen is actually visible in the live preview right now —
  // base screens track currentScreen, but overlays (chat detail, notification,
  // gems) render independently of it, so check those booleans first.
  const activeScreenId: ScreenId = useMemo(() => {
    if (activeChat) return 'chatdetail'
    if (activeCharacterId && activeCreatorName) return 'creatorprofile'
    if (activeCharacterId) return 'characterprofile'
    if (notifOpen) return 'notification'
    if (purchaseOpen) return 'purchase'
    if (gemHistoryOpen) return 'gemhistory'
    if (gemsOpen) return 'gems'
    return currentScreen
  }, [activeChat, activeCharacterId, activeCreatorName, notifOpen, purchaseOpen, gemHistoryOpen, gemsOpen, currentScreen])

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
      notification: {},
      gems: {},
      gemhistory: {},
      purchase: {},
      characterprofile: {},
      creatorprofile: {},
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

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_STRINGS.filter(
      (s) =>
        s.key.toLowerCase().includes(q) ||
        String(s.category).toLowerCase().includes(q) ||
        s.locales.id?.toLowerCase().includes(q) ||
        s.locales.en?.toLowerCase().includes(q)
    ).slice(0, 60)
  }, [query])

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
    setSelectedKey(key)
    const rec = screenId ? { screenId, zone: zone ?? 'page' } : usage.find((u) => u.key === key)
    setSelectedOccurrence(rec ? { screenId: rec.screenId, zone: rec.zone } : null)
    if (rec) {
      closeChat()
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

  useEffect(() => {
    if (!selectedKey) return
    const t = setTimeout(() => {
      const el = document.querySelector(
        buildStrSelector(selectedKey, selectedOccurrence?.screenId, selectedOccurrence?.zone)
      ) as HTMLElement | null
      if (el) {
        setOverflowFlag(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      } else {
        setOverflowFlag(null)
      }
    }, 380)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, selectedOccurrence, locale, overrides[selectedKey ?? '']])

  const selectedEntry = selectedKey ? getEntry(selectedKey) : null

  return (
    <div className="w-[360px] shrink-0 h-full border-r border-imely-line bg-white flex flex-col">
      <div className="p-3 border-b border-imely-line">
        <div className="font-bold text-sm text-imely-ink mb-2">String Inspector</div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          <div className="p-2">
            <div className="text-[11px] text-gray-400 px-2 py-1">
              {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
            </div>
            {searchResults.map((s) => (
              <KeyRow
                key={s.key}
                entryKey={s.key}
                label={s.locales.id || s.locales.en}
                wired={wiredKeys.has(s.key)}
                active={selectedKey === s.key}
                onClick={() => jumpTo(s.key)}
              />
            ))}
          </div>
        ) : (
          (
            [
              'feed',
              'chatlist',
              'profile',
              'chatdetail',
              'characterprofile',
              'creatorprofile',
              'notification',
              'gems',
              'gemhistory',
              'purchase',
            ] as ScreenId[]
          ).map((screenId) => {
            const isOpen = openScreens.has(screenId)
            const zones = sortedZones(Object.keys(usageByScreen[screenId]))
            return (
              <div key={screenId} className="p-2">
                <button
                  onClick={() => toggleScreen(screenId)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-gray-50"
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    {SCREEN_LABEL[screenId]} · {screenCount(screenId)}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                {isOpen &&
                  zones.map((zone) => (
                    <div key={zone} className="mt-0.5">
                      {zone !== 'page' && (
                        <div className="text-[10px] font-semibold text-gray-400 uppercase px-2 pt-2 pb-0.5">
                          {ZONE_LABEL[zone] ?? zone}
                        </div>
                      )}
                      {usageByScreen[screenId][zone].map((key) => {
                        const e = getEntry(key)
                        return (
                          <KeyRow
                            key={`${zone}-${key}`}
                            entryKey={key}
                            label={e?.locales.id || e?.locales.en || key}
                            wired
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
                  ))}
              </div>
            )
          })
        )}
      </div>

      {selectedEntry && (
        <div className="border-t border-imely-line p-3 bg-gray-50 max-h-[46%] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] text-gray-500 break-all pr-2">{selectedEntry.key}</div>
            <button
              onClick={() => {
                setSelectedKey(null)
                setSelectedOccurrence(null)
              }}
              className="text-gray-400 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {selectedEntry.category} {selectedEntry.subcategory ? `› ${selectedEntry.subcategory}` : ''}
          </div>

          {!wiredKeys.has(selectedEntry.key) && (
            <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-md px-2 py-1.5">
              Not wired into a screen in this build yet — locale values only.
            </div>
          )}

          {overflowFlag && wiredKeys.has(selectedEntry.key) && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 rounded-md px-2 py-1.5">
              <AlertTriangle size={13} /> Text overflows its container at this length
            </div>
          )}

          <div className="mt-2 space-y-1.5">
            {LOCALES.map((l) => (
              <div key={l.id} className="text-[12px]">
                <span className="text-gray-400 font-semibold mr-1">{l.label}:</span>
                <span className="text-imely-ink">{selectedEntry.locales[l.id]}</span>
              </div>
            ))}
          </div>

          <div className="mt-2.5">
            <div className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
              Test override (stress-test length)
              {overrides[selectedEntry.key] && (
                <button
                  onClick={() => setOverride(selectedEntry.key, null)}
                  className="text-gray-400 flex items-center gap-0.5"
                >
                  <RotateCcw size={11} /> reset
                </button>
              )}
            </div>
            <textarea
              value={overrides[selectedEntry.key] ?? ''}
              onChange={(e) => setOverride(selectedEntry.key, e.target.value)}
              placeholder="Type a long translation to test overflow…"
              className="w-full text-[12px] border border-imely-line rounded-lg p-2 outline-none focus:border-imely-primary resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function KeyRow({
  entryKey,
  label,
  wired,
  active,
  onClick,
}: {
  entryKey: string
  label?: string
  wired: boolean
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={entryKey}
      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${
        active ? 'bg-imely-mint' : 'hover:bg-gray-50'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${wired ? 'bg-imely-primary' : 'bg-gray-300'}`} />
      <span className="text-[12.5px] text-imely-ink truncate flex-1">{label}</span>
    </button>
  )
}
