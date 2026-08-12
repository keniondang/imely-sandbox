import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Locale } from '../lib/strings'

export type ScreenId =
  | 'feed'
  | 'chatlist'
  | 'profile'
  | 'chatdetail'
  | 'notification'
  | 'gems'
  | 'gemhistory'
  | 'purchase'
  | 'characterprofile'
  | 'creatorprofile'

export type PurchaseTab = 'club' | 'gem'

// 'page' is a screen's always-visible content. Anything else ('menu', 'popup', ...)
// is a sub-surface that only exists in the DOM while its own local state has it
// open — see ScreenScope.tsx's ZoneScope and hooks/usePopupRequest.ts.
export type Zone = string

interface UsageRecord {
  key: string
  screenId: ScreenId
  zone: Zone
}

interface PopupRequest {
  screenId: ScreenId
  zone: Zone
}

export interface ChatTarget {
  id: string
  name: string
  color: string
}

interface AppState {
  locale: Locale
  setLocale: (l: Locale) => void

  currentScreen: ScreenId
  setCurrentScreen: (s: ScreenId) => void

  overrides: Record<string, string>
  setOverride: (key: string, value: string | null) => void

  inspectorOpen: boolean
  setInspectorOpen: (v: boolean) => void

  // key (+ its exact screen/zone occurrence) currently requested to be
  // located + highlighted in the live preview — screen/zone matter because
  // the same key can render more than once on a screen (e.g. on the page
  // and inside a popup), so the key alone doesn't address a unique element
  focusKey: string | null
  focusScreenId: ScreenId | null
  focusZone: Zone | null
  focusToken: number
  requestFocus: (key: string, screenId: ScreenId, zone: Zone) => void

  // registry of which screen (and zone within it — page/menu/popup/…) renders
  // which string key, built as screens mount
  usage: UsageRecord[]
  registerUsage: (rec: UsageRecord) => void

  // broadcast request for a screen's local popup/menu state to open (or close,
  // if a different zone on the same screen was requested) — see usePopupRequest
  popupRequest: PopupRequest | null
  popupRequestToken: number
  requestPopup: (screenId: ScreenId, zone: Zone) => void

  // full-screen chat overlay, opened by tapping a thread or from a character
  // profile's "Pesan" button
  activeChat: ChatTarget | null
  openChat: (target: ChatTarget) => void
  closeChat: () => void

  // character profile overlay, opened by tapping a character card in the feed
  // (or a "Karakter Serupa" card); id looks up the full record in
  // MOCK_FEED_CHARACTERS, same as activeChat does for chat threads/cards
  activeCharacterId: string | null
  openCharacterProfile: (id: string) => void
  closeCharacterProfile: () => void

  // creator profile — pushed on top of a character profile from its "Kreator"
  // row; name looks up the creator's characters in MOCK_FEED_CHARACTERS
  activeCreatorName: string | null
  openCreatorProfile: (name: string) => void
  closeCreatorProfile: () => void

  // Beranda filter bottom-sheet
  filterOpen: boolean
  openFilter: () => void
  closeFilter: () => void

  // Notification page overlay
  notifOpen: boolean
  openNotif: () => void
  closeNotif: () => void

  // Gem balance / missions page overlay
  gemsOpen: boolean
  openGems: () => void
  closeGems: () => void

  // Gem history — pushed on top of the gems overlay from "Riwayat Gem-mu";
  // its own back button just closes this and reveals gems again underneath
  gemHistoryOpen: boolean
  openGemHistory: () => void
  closeGemHistory: () => void

  // MêLy Club / Gem purchase overlay — reachable from multiple screens
  // (gems, profile, …), so it's its own top-level overlay rather than local
  // state on any one of them. openPurchase picks which tab it opens on.
  purchaseOpen: boolean
  purchaseTab: PurchaseTab
  openPurchase: (tab: PurchaseTab) => void
  closePurchase: () => void

  // lightweight toast, e.g. for stub actions not built yet
  toast: string | null
  showToast: (msg: string) => void
}

const AppCtx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('id')
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('feed')
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [focusScreenId, setFocusScreenId] = useState<ScreenId | null>(null)
  const [focusZone, setFocusZone] = useState<Zone | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const [popupRequest, setPopupRequest] = useState<PopupRequest | null>(null)
  const [popupRequestToken, setPopupRequestToken] = useState(0)
  const [activeChat, setActiveChat] = useState<ChatTarget | null>(null)
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null)
  const [activeCreatorName, setActiveCreatorName] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [gemsOpen, setGemsOpen] = useState(false)
  const [gemHistoryOpen, setGemHistoryOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [purchaseTab, setPurchaseTab] = useState<PurchaseTab>('club')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setOverride = (key: string, value: string | null) => {
    setOverrides((prev) => {
      const next = { ...prev }
      if (value === null || value === '') delete next[key]
      else next[key] = value
      return next
    })
  }

  const registerUsage = (rec: UsageRecord) => {
    setUsage((prev) => {
      if (prev.some((u) => u.key === rec.key && u.screenId === rec.screenId && u.zone === rec.zone)) return prev
      return [...prev, rec]
    })
  }

  const requestFocus = (key: string, screenId: ScreenId, zone: Zone) => {
    setFocusKey(key)
    setFocusScreenId(screenId)
    setFocusZone(zone)
    setFocusToken((t) => t + 1)
  }

  const requestPopup = (screenId: ScreenId, zone: Zone) => {
    setPopupRequest({ screenId, zone })
    setPopupRequestToken((t) => t + 1)
  }

  const openChat = (target: ChatTarget) => setActiveChat(target)
  const closeChat = () => setActiveChat(null)

  const openCharacterProfile = (id: string) => setActiveCharacterId(id)
  const closeCharacterProfile = () => {
    setActiveCharacterId(null)
    setActiveCreatorName(null)
  }

  const openCreatorProfile = (name: string) => setActiveCreatorName(name)
  const closeCreatorProfile = () => setActiveCreatorName(null)

  const openFilter = () => setFilterOpen(true)
  const closeFilter = () => setFilterOpen(false)

  const openNotif = () => setNotifOpen(true)
  const closeNotif = () => setNotifOpen(false)

  const openGems = () => setGemsOpen(true)
  const closeGems = () => {
    setGemsOpen(false)
    setGemHistoryOpen(false)
  }

  const openGemHistory = () => setGemHistoryOpen(true)
  const closeGemHistory = () => setGemHistoryOpen(false)

  const openPurchase = (tab: PurchaseTab) => {
    setPurchaseTab(tab)
    setPurchaseOpen(true)
  }
  const closePurchase = () => setPurchaseOpen(false)

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 1400)
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      currentScreen,
      setCurrentScreen,
      overrides,
      setOverride,
      inspectorOpen,
      setInspectorOpen,
      focusKey,
      focusScreenId,
      focusZone,
      focusToken,
      requestFocus,
      usage,
      registerUsage,
      popupRequest,
      popupRequestToken,
      requestPopup,
      activeChat,
      openChat,
      closeChat,
      activeCharacterId,
      openCharacterProfile,
      closeCharacterProfile,
      activeCreatorName,
      openCreatorProfile,
      closeCreatorProfile,
      filterOpen,
      openFilter,
      closeFilter,
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
      purchaseTab,
      openPurchase,
      closePurchase,
      toast,
      showToast,
    }),
    [
      locale,
      currentScreen,
      overrides,
      inspectorOpen,
      focusKey,
      focusScreenId,
      focusZone,
      focusToken,
      usage,
      popupRequest,
      popupRequestToken,
      activeChat,
      activeCharacterId,
      activeCreatorName,
      filterOpen,
      notifOpen,
      gemsOpen,
      gemHistoryOpen,
      purchaseOpen,
      purchaseTab,
      toast,
    ]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
