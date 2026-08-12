import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Locale } from '../lib/strings'

export type ScreenId = 'feed' | 'chatlist' | 'profile' | 'chatdetail' | 'notification' | 'gems'

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

  // full-screen chat overlay, opened by tapping a thread or a character card
  activeChat: ChatTarget | null
  openChat: (target: ChatTarget) => void
  closeChat: () => void

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
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [gemsOpen, setGemsOpen] = useState(false)
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

  const openFilter = () => setFilterOpen(true)
  const closeFilter = () => setFilterOpen(false)

  const openNotif = () => setNotifOpen(true)
  const closeNotif = () => setNotifOpen(false)

  const openGems = () => setGemsOpen(true)
  const closeGems = () => setGemsOpen(false)

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
      filterOpen,
      openFilter,
      closeFilter,
      notifOpen,
      openNotif,
      closeNotif,
      gemsOpen,
      openGems,
      closeGems,
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
      filterOpen,
      notifOpen,
      gemsOpen,
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
