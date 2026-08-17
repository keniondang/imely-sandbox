import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SourceLocale, TargetLocale } from '../lib/strings'
import type { LocalizedText } from '../data/mockContent'
import zhTwBaselineRaw from '../data/zhTwBaseline.json'

const ZH_TW_BASELINE = zhTwBaselineRaw as Record<string, string>

// Translations are real work product now, not throwaway test drafts — a
// translator producing ~1,479 x 2 new-language strings across many sessions
// can't afford to lose everything on an accidental refresh. Persisted as one
// blob (small enough even fully filled in — well under localStorage's
// ~5-10MB limit) rather than one key per string, to keep load/save trivial.
const OVERRIDES_STORAGE_KEY = 'imely-sandbox:overrides'

function loadStoredOverrides(): Record<string, Partial<Record<TargetLocale, string>>> {
  let stored: Record<string, Partial<Record<TargetLocale, string>>> = {}
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY)
    stored = raw ? JSON.parse(raw) : {}
  } catch {
    stored = {}
  }
  // The source sheet now ships zh-TW ~99% pre-translated (imported via
  // scripts/import-strings.mjs into zhTwBaseline.json) — seed it in as the
  // starting value for any key the translator hasn't touched yet, so a
  // fresh session starts near-complete instead of at 0%. Idempotent: only
  // fills gaps, never overwrites a translator's own saved edit (even one
  // that deliberately differs from the sheet).
  const merged: Record<string, Partial<Record<TargetLocale, string>>> = { ...stored }
  for (const key in ZH_TW_BASELINE) {
    if (merged[key]?.['zh-TW'] !== undefined) continue
    merged[key] = { ...merged[key], 'zh-TW': ZH_TW_BASELINE[key] }
  }
  return merged
}

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
  | 'chatoptions'
  | 'devices'
  | 'account'
  | 'mycharacters'
  | 'following'
  | 'badges'
  | 'appearance'
  | 'settings'
  | 'notificationsettings'
  | 'videosettings'
  | 'about'
  | 'verifyemail'
  | 'username'
  | 'deleteaccount'
  | 'characterform'

export type PurchaseTab = 'club' | 'gem'

// Shared between the Inspector's browse list and the TranslationPanel's
// prev/next navigation, so "next string" / "next page or category" steps
// through exactly what the left sidebar is showing right now.
// 'translated' and 'untranslated' key off the same underlying data (whether
// `overrides[key][targetLocale]` is set) and are exact inverses — the
// actionable "what's done" / "what's left" split for a translator.
export type FilterMode = 'all' | 'unwired' | 'untranslated' | 'translated'

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
  name: LocalizedText
  color: string
}

interface AppState {
  // The language actively being translated into — the only thing that can
  // be selected, edited, and tracked for completion. id/en/vi are reference
  // material now, not alternate "locales" the whole tool can browse in.
  targetLocale: TargetLocale
  setTargetLocale: (l: TargetLocale) => void

  // Which source language (id/en/vi) the live preview and translation panel
  // show as the reference/fallback text for anything not yet translated —
  // a translator's own preference, independent of targetLocale.
  baseLocale: SourceLocale
  setBaseLocale: (l: SourceLocale) => void

  currentScreen: ScreenId
  setCurrentScreen: (s: ScreenId) => void

  // Translator drafts, scoped per key AND per target locale — a draft
  // written while "TH" was selected only shows up again when "TH" is
  // selected. Only written on Apply; see livePreview for what shows while
  // still typing. id/en/vi are never overridden — they're read-only
  // reference material pulled straight from the sheet.
  overrides: Record<string, Partial<Record<TargetLocale, string>>>
  applyOverride: (key: string, locale: TargetLocale, value: string) => void
  resetOverride: (key: string, locale: TargetLocale) => void

  // Ephemeral — mirrors the translation panel's textarea into the live phone
  // preview on every keystroke, before Apply commits it into `overrides`.
  // Single slot: switching keys/locale without applying just drops it, since
  // scratch drafts aren't meant to be remembered (only applied ones are).
  livePreview: { key: string; locale: TargetLocale; text: string } | null
  setLivePreview: (v: { key: string; locale: TargetLocale; text: string } | null) => void

  // Which key (+ exact screen/zone occurrence) the translation panel is
  // showing — shared between the Inspector (which sets it) and the panel
  // (which reads it), since they're now separate components on opposite sides.
  selectedKey: string | null
  selectedOccurrence: { screenId: ScreenId; zone: Zone } | null
  selectKey: (key: string | null, occurrence: { screenId: ScreenId; zone: Zone } | null) => void

  inspectorOpen: boolean
  setInspectorOpen: (v: boolean) => void

  // Browse list filter — lives in context (not local Inspector state) so the
  // TranslationPanel's prev/next buttons can walk the same ordered list the
  // left sidebar is currently showing.
  filterMode: FilterMode
  setFilterMode: (v: FilterMode) => void

  // Which single thing is drilled into in the Inspector's tree right now —
  // e.g. ['account'] (just Kelola Akun open) or ['account', 'menu'] (drilled
  // further into just its Menu group). Lives here (not local Inspector
  // state) so the TranslationPanel's prev/next buttons can drive the same
  // drill-down the sidebar shows, keeping both panels in sync.
  focusPath: string[]
  setFocusPath: (v: string[]) => void

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

  // chat's Opsi page — pushed on top of chatdetail from its three-dot button
  chatOptionsOpen: boolean
  openChatOptions: () => void
  closeChatOptions: () => void

  // character profile overlay, opened by tapping a character card in the feed
  // (or a "Karakter Serupa" card); id looks up the full record in
  // MOCK_FEED_CHARACTERS, same as activeChat does for chat threads/cards
  activeCharacterId: string | null
  openCharacterProfile: (id: string) => void
  closeCharacterProfile: () => void

  // creator profile — pushed on top of a character profile from its "Kreator"
  // row; id looks up the creator's characters in MOCK_FEED_CHARACTERS via
  // creatorId (a stable identity, unlike the creator's display name, which
  // is now locale-varying LocalizedText and can't double as a lookup key)
  activeCreatorId: string | null
  openCreatorProfile: (id: string) => void
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

  // Profile's account "Opsi" sheet (3-dot button) — lives at this level
  // rather than local ProfileScreen state so it can be positioned against
  // the phone frame (see FilterModal) instead of Profile's own scrollable
  // content box.
  profileMenuOpen: boolean
  openProfileMenu: () => void
  closeProfileMenu: () => void

  // "Perangkat Masuk" (active sessions) — pushed on top of Profile from the
  // account Opsi sheet's "Perangkat Masuk" row
  devicesOpen: boolean
  openDevices: () => void
  closeDevices: () => void

  // "Kelola akun" — pushed on top of Profile from either its own pill button
  // or the account Opsi sheet's "Kelola akun" row (two entry points, same
  // destination)
  accountOpen: boolean
  openAccount: () => void
  closeAccount: () => void

  // "Karaktermu" — pushed on top of Profile from its "Karakter saya" row
  myCharactersOpen: boolean
  openMyCharacters: () => void
  closeMyCharacters: () => void

  // "Mengikuti" — pushed on top of Profile from its "Mengikuti" row
  followingOpen: boolean
  openFollowing: () => void
  closeFollowing: () => void

  // "Lencana" — pushed on top of Profile from its badge pill
  badgesOpen: boolean
  openBadges: () => void
  closeBadges: () => void

  // "Tampilan" — pushed on top of Profile from its "Tampilan & bahasa" row
  appearanceOpen: boolean
  openAppearance: () => void
  closeAppearance: () => void

  // "Pengaturan" — pushed on top of Profile from its "Pengaturan" row
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  // "Notifikasi" settings — pushed on top of Pengaturan from its "Notifikasi" row
  notificationSettingsOpen: boolean
  openNotificationSettings: () => void
  closeNotificationSettings: () => void

  // "Video" settings — pushed on top of Pengaturan from its "Video" row
  videoSettingsOpen: boolean
  openVideoSettings: () => void
  closeVideoSettings: () => void

  // Username created via the "Nama Pengguna" screen — read back by Kelola
  // akun's own "Nama Pengguna" row, so it has to live above both (they're
  // sibling overlays, not nested), unlike the other Kelola akun edits which
  // are simple modals local to AccountScreen itself.
  accountUsername: string
  setAccountUsername: (v: string) => void

  // "Tentang Kami" — pushed on top of Profile from its support row
  aboutOpen: boolean
  openAbout: () => void
  closeAbout: () => void

  // "Verifikasi" email entry — pushed on top of Kelola akun from the
  // Verifikasi Akun sheet's "Gunakan email" button, or directly from the
  // "Email" row
  verifyEmailOpen: boolean
  openVerifyEmail: () => void
  closeVerifyEmail: () => void

  // "Nama Pengguna" — pushed on top of Kelola akun from its "Nama Pengguna" row
  usernameOpen: boolean
  openUsername: () => void
  closeUsername: () => void

  // "Hapus akun" — pushed on top of Kelola akun from its "Hapus akun imely" link
  deleteAccountOpen: boolean
  openDeleteAccount: () => void
  closeDeleteAccount: () => void

  // "Buat/Edit Karakter" — a top-level overlay (always renders above whatever
  // else is open) since it's reachable from the always-present header "+"
  // icon as well as from Karaktermu, not scoped to one page's overlay chain.
  // `characterFormEditId` set = editing that character; null = creating new.
  characterFormOpen: boolean
  characterFormEditId: string | null
  openCharacterForm: (editId?: string) => void
  closeCharacterForm: () => void

  // lightweight toast, e.g. for stub actions not built yet
  toast: string | null
  showToast: (msg: string) => void
}

const AppCtx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [targetLocale, setTargetLocale] = useState<TargetLocale>('zh-TW')
  const [baseLocale, setBaseLocale] = useState<SourceLocale>('id')
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('feed')
  const [overrides, setOverrides] = useState<Record<string, Partial<Record<TargetLocale, string>>>>(loadStoredOverrides)
  useEffect(() => {
    try {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, ...) —
      // translations still work for this session, just won't survive a
      // reload. Nothing actionable to do here, so fail silently.
    }
  }, [overrides])
  const [livePreview, setLivePreview] = useState<{ key: string; locale: TargetLocale; text: string } | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedOccurrence, setSelectedOccurrence] = useState<{ screenId: ScreenId; zone: Zone } | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [focusPath, setFocusPath] = useState<string[]>([])
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const [popupRequest, setPopupRequest] = useState<PopupRequest | null>(null)
  const [popupRequestToken, setPopupRequestToken] = useState(0)
  const [activeChat, setActiveChat] = useState<ChatTarget | null>(null)
  const [chatOptionsOpen, setChatOptionsOpen] = useState(false)
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null)
  const [activeCreatorId, setActiveCreatorId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [gemsOpen, setGemsOpen] = useState(false)
  const [gemHistoryOpen, setGemHistoryOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [purchaseTab, setPurchaseTab] = useState<PurchaseTab>('club')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [devicesOpen, setDevicesOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [myCharactersOpen, setMyCharactersOpen] = useState(false)
  const [followingOpen, setFollowingOpen] = useState(false)
  const [badgesOpen, setBadgesOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const [videoSettingsOpen, setVideoSettingsOpen] = useState(false)
  const [accountUsername, setAccountUsername] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false)
  const [usernameOpen, setUsernameOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [characterFormOpen, setCharacterFormOpen] = useState(false)
  const [characterFormEditId, setCharacterFormEditId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyOverride = (key: string, locale: TargetLocale, value: string) => {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], [locale]: value } }))
  }

  const resetOverride = (key: string, locale: TargetLocale) => {
    setOverrides((prev) => {
      if (!prev[key]) return prev
      const nextForKey = { ...prev[key] }
      delete nextForKey[locale]
      const next = { ...prev }
      if (Object.keys(nextForKey).length === 0) delete next[key]
      else next[key] = nextForKey
      return next
    })
  }

  const selectKey = (key: string | null, occurrence: { screenId: ScreenId; zone: Zone } | null) => {
    setSelectedKey(key)
    setSelectedOccurrence(occurrence)
    setLivePreview(null)
  }

  const registerUsage = (rec: UsageRecord) => {
    setUsage((prev) => {
      if (prev.some((u) => u.key === rec.key && u.screenId === rec.screenId && u.zone === rec.zone)) return prev
      return [...prev, rec]
    })
  }

  const requestPopup = (screenId: ScreenId, zone: Zone) => {
    setPopupRequest({ screenId, zone })
    setPopupRequestToken((t) => t + 1)
  }

  const openChat = (target: ChatTarget) => setActiveChat(target)
  const closeChat = () => {
    setActiveChat(null)
    setChatOptionsOpen(false)
  }

  const openChatOptions = () => setChatOptionsOpen(true)
  const closeChatOptions = () => setChatOptionsOpen(false)

  const openCharacterProfile = (id: string) => setActiveCharacterId(id)
  const closeCharacterProfile = () => {
    setActiveCharacterId(null)
    setActiveCreatorId(null)
  }

  const openCreatorProfile = (id: string) => setActiveCreatorId(id)
  const closeCreatorProfile = () => setActiveCreatorId(null)

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

  const openProfileMenu = () => setProfileMenuOpen(true)
  const closeProfileMenu = () => setProfileMenuOpen(false)

  const openDevices = () => setDevicesOpen(true)
  const closeDevices = () => setDevicesOpen(false)

  const openAccount = () => setAccountOpen(true)
  const closeAccount = () => setAccountOpen(false)

  const openMyCharacters = () => setMyCharactersOpen(true)
  const closeMyCharacters = () => setMyCharactersOpen(false)

  const openFollowing = () => setFollowingOpen(true)
  const closeFollowing = () => setFollowingOpen(false)

  const openBadges = () => setBadgesOpen(true)
  const closeBadges = () => setBadgesOpen(false)

  const openAppearance = () => setAppearanceOpen(true)
  const closeAppearance = () => setAppearanceOpen(false)

  const openSettings = () => setSettingsOpen(true)
  const closeSettings = () => {
    setSettingsOpen(false)
    setNotificationSettingsOpen(false)
    setVideoSettingsOpen(false)
  }

  const openNotificationSettings = () => setNotificationSettingsOpen(true)
  const closeNotificationSettings = () => setNotificationSettingsOpen(false)

  const openVideoSettings = () => setVideoSettingsOpen(true)
  const closeVideoSettings = () => setVideoSettingsOpen(false)

  const openAbout = () => setAboutOpen(true)
  const closeAbout = () => setAboutOpen(false)

  const openVerifyEmail = () => setVerifyEmailOpen(true)
  const closeVerifyEmail = () => setVerifyEmailOpen(false)

  const openUsername = () => setUsernameOpen(true)
  const closeUsername = () => setUsernameOpen(false)

  const openDeleteAccount = () => setDeleteAccountOpen(true)
  const closeDeleteAccount = () => setDeleteAccountOpen(false)

  const openCharacterForm = (editId?: string) => {
    setCharacterFormEditId(editId ?? null)
    setCharacterFormOpen(true)
  }
  const closeCharacterForm = () => setCharacterFormOpen(false)

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 1400)
  }

  const value = useMemo(
    () => ({
      targetLocale,
      setTargetLocale,
      baseLocale,
      setBaseLocale,
      currentScreen,
      setCurrentScreen,
      overrides,
      applyOverride,
      resetOverride,
      livePreview,
      setLivePreview,
      selectedKey,
      selectedOccurrence,
      selectKey,
      inspectorOpen,
      setInspectorOpen,
      filterMode,
      setFilterMode,
      focusPath,
      setFocusPath,
      usage,
      registerUsage,
      popupRequest,
      popupRequestToken,
      requestPopup,
      activeChat,
      openChat,
      closeChat,
      chatOptionsOpen,
      openChatOptions,
      closeChatOptions,
      activeCharacterId,
      openCharacterProfile,
      closeCharacterProfile,
      activeCreatorId,
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
      profileMenuOpen,
      openProfileMenu,
      closeProfileMenu,
      devicesOpen,
      openDevices,
      closeDevices,
      accountOpen,
      openAccount,
      closeAccount,
      myCharactersOpen,
      openMyCharacters,
      closeMyCharacters,
      followingOpen,
      openFollowing,
      closeFollowing,
      badgesOpen,
      openBadges,
      closeBadges,
      appearanceOpen,
      openAppearance,
      closeAppearance,
      settingsOpen,
      openSettings,
      closeSettings,
      notificationSettingsOpen,
      openNotificationSettings,
      closeNotificationSettings,
      videoSettingsOpen,
      openVideoSettings,
      closeVideoSettings,
      accountUsername,
      setAccountUsername,
      aboutOpen,
      openAbout,
      closeAbout,
      verifyEmailOpen,
      openVerifyEmail,
      closeVerifyEmail,
      usernameOpen,
      openUsername,
      closeUsername,
      deleteAccountOpen,
      openDeleteAccount,
      closeDeleteAccount,
      characterFormOpen,
      characterFormEditId,
      openCharacterForm,
      closeCharacterForm,
      toast,
      showToast,
    }),
    [
      targetLocale,
      baseLocale,
      currentScreen,
      overrides,
      inspectorOpen,
      filterMode,
      focusPath,
      usage,
      overrides,
      livePreview,
      selectedKey,
      selectedOccurrence,
      popupRequest,
      popupRequestToken,
      activeChat,
      chatOptionsOpen,
      activeCharacterId,
      activeCreatorId,
      filterOpen,
      notifOpen,
      gemsOpen,
      gemHistoryOpen,
      purchaseOpen,
      purchaseTab,
      profileMenuOpen,
      devicesOpen,
      accountOpen,
      myCharactersOpen,
      followingOpen,
      badgesOpen,
      appearanceOpen,
      settingsOpen,
      notificationSettingsOpen,
      videoSettingsOpen,
      accountUsername,
      aboutOpen,
      verifyEmailOpen,
      usernameOpen,
      deleteAccountOpen,
      characterFormOpen,
      characterFormEditId,
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
