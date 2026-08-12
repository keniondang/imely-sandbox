import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Locale } from '../lib/strings'

export type ScreenId = 'feed' | 'chatlist' | 'profile' | 'chatdetail' | 'notification'

interface UsageRecord {
  key: string
  screenId: ScreenId
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

  // key currently requested to be located + highlighted in the live preview
  focusKey: string | null
  focusToken: number
  requestFocus: (key: string) => void

  // registry of which screen renders which string key, built as screens mount
  usage: UsageRecord[]
  registerUsage: (rec: UsageRecord) => void

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
  const [focusToken, setFocusToken] = useState(0)
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const [activeChat, setActiveChat] = useState<ChatTarget | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
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
      if (prev.some((u) => u.key === rec.key && u.screenId === rec.screenId)) return prev
      return [...prev, rec]
    })
  }

  const requestFocus = (key: string) => {
    setFocusKey(key)
    setFocusToken((t) => t + 1)
  }

  const openChat = (target: ChatTarget) => setActiveChat(target)
  const closeChat = () => setActiveChat(null)

  const openFilter = () => setFilterOpen(true)
  const closeFilter = () => setFilterOpen(false)

  const openNotif = () => setNotifOpen(true)
  const closeNotif = () => setNotifOpen(false)

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
      focusToken,
      requestFocus,
      usage,
      registerUsage,
      activeChat,
      openChat,
      closeChat,
      filterOpen,
      openFilter,
      closeFilter,
      notifOpen,
      openNotif,
      closeNotif,
      toast,
      showToast,
    }),
    [
      locale,
      currentScreen,
      overrides,
      inspectorOpen,
      focusKey,
      focusToken,
      usage,
      activeChat,
      filterOpen,
      notifOpen,
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
