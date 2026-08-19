import { useEffect, useRef, useState } from 'react'
import { PanelLeftOpen, PanelLeftClose, X, Download, Focus, Sun, Moon } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import { ScreenScope } from './context/ScreenScope'
import { useStringHighlighter } from './hooks/useStringHighlighter'
import { useOpenScreen } from './hooks/useNavigateToString'
import { WARM_UP_SCREENS, WARM_UP_ZONES } from './sandbox/browseConfig'
import { exportStringsToXlsx } from './lib/exportXlsx'
import { LOCALE_LABEL, SOURCE_LOCALES, TARGET_LOCALES, type Locale } from './lib/strings'
import { PhoneFrame, FRAME_WIDTH, FRAME_HEIGHT } from './components/shell/PhoneFrame'
import { useFitScale } from './hooks/useFitScale'
import { Header } from './components/shell/Header'
import { BottomNav } from './components/shell/BottomNav'
import { ToastBubble } from './components/shell/ToastBubble'
import { resolveToastPreview } from './lib/toastPreview'
import { FilterModal } from './components/FilterModal'
import { FeedScreen } from './screens/FeedScreen'
import { ChatListScreen } from './screens/ChatListScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ChatDetailScreen } from './screens/ChatDetailScreen'
import { NotificationScreen } from './screens/NotificationScreen'
import { GemScreen } from './screens/GemScreen'
import { GemHistoryScreen } from './screens/GemHistoryScreen'
import { PurchaseScreen } from './screens/PurchaseScreen'
import { CharacterProfileScreen } from './screens/CharacterProfileScreen'
import { CreatorProfileScreen } from './screens/CreatorProfileScreen'
import { QrCodeScreen } from './screens/QrCodeScreen'
import { ChatOptionsScreen } from './screens/ChatOptionsScreen'
import { DevicesScreen } from './screens/DevicesScreen'
import { AccountScreen } from './screens/AccountScreen'
import { MyCharactersScreen } from './screens/MyCharactersScreen'
import { FollowingScreen } from './screens/FollowingScreen'
import { BadgesScreen } from './screens/BadgesScreen'
import { AppearanceScreen } from './screens/AppearanceScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen'
import { VideoSettingsScreen } from './screens/VideoSettingsScreen'
import { AboutScreen } from './screens/AboutScreen'
import { VerifyEmailScreen } from './screens/VerifyEmailScreen'
import { UsernameScreen } from './screens/UsernameScreen'
import { DeleteAccountScreen } from './screens/DeleteAccountScreen'
import { CharacterFormScreen } from './screens/CharacterFormScreen'
import { ProfileMenuSheet } from './components/ProfileMenuSheet'
import { AvatarMenuSheet } from './components/AvatarMenuSheet'
import { Inspector } from './sandbox/Inspector'
import { useLivePreviewFollow } from './hooks/useLivePreviewFollow'
import { TranslationPanel } from './sandbox/TranslationPanel'
import { FocusPanel } from './sandbox/FocusPanel'

function Shell() {
  const {
    currentScreen,
    inspectorOpen,
    setInspectorOpen,
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorId,
    filterOpen,
    closeFilter,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    purchaseOpen,
    profileMenuOpen,
    closeProfileMenu,
    avatarMenuOpen,
    closeAvatarMenu,
    showToast,
    devicesOpen,
    openDevices,
    accountOpen,
    openAccount,
    myCharactersOpen,
    followingOpen,
    badgesOpen,
    qrCodeOpen,
    appearanceOpen,
    settingsOpen,
    notificationSettingsOpen,
    videoSettingsOpen,
    aboutOpen,
    verifyEmailOpen,
    usernameOpen,
    deleteAccountOpen,
    characterFormOpen,
    selectedKey,
    selectKey,
    requestPopup,
    toast,
    overrides,
    priming,
    setPriming,
    baseLocale,
    targetLocale,
    livePreview,
    toastPreview,
    focusMode,
    setFocusMode,
    darkMode,
    setDarkMode,
  } = useApp()
  useStringHighlighter()
  const activeScreenId = useLivePreviewFollow()
  const openScreen = useOpenScreen()
  // The live preview fills whatever space it has (down to the bottom of the
  // window) instead of rendering at a fixed size and leaving a gap below it.
  const { containerRef: previewRef, scale: previewScale } = useFitScale(FRAME_WIDTH, FRAME_HEIGHT, 24, 1.5)

  // Visit every screen once behind a brief cover so the Inspector's key
  // counts are accurate from the start, instead of showing 0 until a
  // translator happens to open each overlay by hand first. Also briefly
  // opens each screen's own local popups/menus (WARM_UP_ZONES) the same
  // way — those live behind a button click inside the screen itself, so
  // mounting the screen alone never registers their strings.
  useEffect(() => {
    let cancelled = false
    async function warmUp() {
      for (const screenId of WARM_UP_SCREENS) {
        if (cancelled) return
        openScreen(screenId)
        await new Promise((resolve) => setTimeout(resolve, 30))
        for (const zone of WARM_UP_ZONES[screenId] ?? []) {
          if (cancelled) return
          requestPopup(screenId, zone)
          await new Promise((resolve) => setTimeout(resolve, 20))
        }
      }
      if (cancelled) return
      openScreen('feed')
      setPriming(false)
    }
    warmUp()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyFilter() {
    closeFilter()
  }

  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportMenuOpen) return
    function onClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [exportMenuOpen])

  function handleExport(locale: Locale) {
    exportStringsToXlsx(overrides, locale)
    setExportMenuOpen(false)
  }

  // Chat detail has its own input bar hugging the bottom of the frame — the
  // usual bottom-anchored toast spot would sit right on top of it, so
  // anything shown while actually inside the message thread (not its Opsi
  // page, which has no such bar) floats higher, over the conversation
  // itself instead.
  const inChatThread = Boolean(activeChat) && !chatOptionsOpen
  const toastAreaStyle = inChatThread ? { top: 230 } : { bottom: 80 }

  const toastPreviewText =
    toastPreview && toastPreview.screenId === activeScreenId
      ? resolveToastPreview(
          toastPreview.key,
          baseLocale,
          livePreview && livePreview.key === toastPreview.key && livePreview.locale === targetLocale
            ? livePreview.text
            : overrides[toastPreview.key]?.[targetLocale]
        )
      : null

  return (
    <div className={`h-screen w-screen flex flex-col bg-subtle overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* one shared title bar spanning the full window, split into
          color-matched segments so all three columns' content starts at the
          same y-offset instead of each panel carrying its own header height */}
      <div className="h-12 flex items-stretch shrink-0">
        {focusMode ? (
          // One unified green bar — no sandbox title/subtitle to split it
          // into segments for, so Focus Mode's whole header is just its own
          // label and the Export action, not sharing space with anything else.
          <div className="flex-1 flex items-center gap-3 px-4 bg-imely-primary min-w-0">
            <Focus size={14} className="text-white shrink-0" />
            <span className="text-[13px] font-semibold text-white">Focus Mode</span>
            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-transform shrink-0"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={() => setFocusMode(false)}
                title="Exit Focus Mode"
                className="flex items-center gap-1 text-[12px] font-semibold text-white border border-white/40 rounded-full pl-2.5 pr-3 py-1.5 hover:bg-white/10 active:scale-[0.97] transition-transform shrink-0"
              >
                <X size={13} /> Exit Focus
              </button>
              <div className="relative shrink-0" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen((v) => !v)}
                  title="Download strings as .xlsx — pick a language"
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-imely-primaryDark bg-surface rounded-full pl-3 pr-3.5 py-1.5 active:scale-[0.97] transition-transform"
                >
                  <Download size={13} /> Export .xlsx
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-surface rounded-lg shadow-lg border border-line py-1 z-50">
                    <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase">Source</div>
                    {SOURCE_LOCALES.map((l) => (
                      <button
                        key={l}
                        onClick={() => handleExport(l)}
                        className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                      >
                        {LOCALE_LABEL[l]}
                      </button>
                    ))}
                    <div className="px-3 py-1 mt-1 text-[10px] font-semibold text-muted uppercase border-t border-line pt-1.5">
                      Target
                    </div>
                    {TARGET_LOCALES.map((l) => (
                      <button
                        key={l}
                        onClick={() => handleExport(l)}
                        className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                      >
                        {LOCALE_LABEL[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {inspectorOpen && (
              <>
                <div className="w-[360px] shrink-0 bg-imely-ink border-b border-white/10 flex items-center px-3">
                  <span className="text-[13px] font-semibold text-white">String Inspector</span>
                </div>
                <div className="w-[360px] shrink-0 bg-surface border-b border-line flex items-center justify-between px-3">
                  <span className="text-[13px] font-semibold text-ink">Translation</span>
                  {selectedKey && (
                    <button
                      onClick={() => selectKey(null, null)}
                      title="Close translation panel"
                      className="text-muted active:scale-90 transition-transform"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
            <div className="flex-1 flex items-center gap-3 px-4 border-b border-line bg-surface min-w-0">
              <button
                onClick={() => setInspectorOpen(!inspectorOpen)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:bg-subtle shrink-0"
              >
                {inspectorOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              </button>
              <span className="text-[13px] font-semibold text-ink truncate">imely localization sandbox</span>
              <span className="text-[11px] text-muted truncate">— live UI preview, not the real app</span>
              <div className="ml-auto flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-subtle active:scale-90 transition-transform shrink-0"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  onClick={() => setFocusMode(true)}
                  title="Focus Mode — review one string at a time"
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-ink border border-line rounded-full pl-3 pr-3.5 py-1.5 hover:bg-subtle active:scale-[0.97] transition-transform"
                >
                  <Focus size={15} /> Focus Mode
                </button>
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setExportMenuOpen((v) => !v)}
                    title="Download strings as .xlsx — pick a language"
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-imely-primary rounded-full pl-3 pr-3.5 py-1.5 active:scale-[0.97] transition-transform"
                  >
                    <Download size={13} /> Export .xlsx
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-40 bg-surface rounded-lg shadow-lg border border-line py-1 z-50">
                      <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase">Source</div>
                      {SOURCE_LOCALES.map((l) => (
                        <button
                          key={l}
                          onClick={() => handleExport(l)}
                          className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                        >
                          {LOCALE_LABEL[l]}
                        </button>
                      ))}
                      <div className="px-3 py-1 mt-1 text-[10px] font-semibold text-muted uppercase border-t border-line pt-1.5">
                        Target
                      </div>
                      {TARGET_LOCALES.map((l) => (
                        <button
                          key={l}
                          onClick={() => handleExport(l)}
                          className="w-full text-left px-3 py-1.5 text-[12.5px] text-ink hover:bg-subtle"
                        >
                          {LOCALE_LABEL[l]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {focusMode ? (
          <FocusPanel />
        ) : (
          inspectorOpen && (
            <>
              <Inspector activeScreenId={activeScreenId} />
              <TranslationPanel />
            </>
          )
        )}

        <div className="flex-1 flex flex-col overflow-hidden">

        <div ref={previewRef} className="flex-1 flex items-center justify-center overflow-hidden">
          <PhoneFrame scale={previewScale}>
            <div className="shrink-0">
              <Header />
            </div>

            <div className="flex-1 overflow-y-auto">
              {currentScreen === 'feed' && (
                <ScreenScope id="feed">
                  <FeedScreen />
                </ScreenScope>
              )}
              {currentScreen === 'chatlist' && (
                <ScreenScope id="chatlist">
                  <ChatListScreen />
                </ScreenScope>
              )}
              {currentScreen === 'profile' && (
                <ScreenScope id="profile">
                  <ProfileScreen />
                </ScreenScope>
              )}
            </div>

            <div className="shrink-0">
              <BottomNav />
            </div>

            {/* full-screen chat overlay — opened by tapping a thread, or from a character profile's "Pesan" button */}
            {activeChat && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface flex flex-col">
                <ScreenScope id="chatdetail">
                  <ChatDetailScreen />
                </ScreenScope>
              </div>
            )}

            {/* chat's Opsi page — pushed on top of chatdetail from its three-dot button */}
            {activeChat && chatOptionsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="chatoptions">
                  <ChatOptionsScreen />
                </ScreenScope>
              </div>
            )}

            {/* character profile — opened by tapping a character card in the feed */}
            {activeCharacterId && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="characterprofile">
                  <CharacterProfileScreen />
                </ScreenScope>
              </div>
            )}

            {/* creator profile — pushed on top of a character profile from its "Kreator" row, or
                reachable directly (e.g. Mengikuti's "Pencipta" tab) without a character underneath */}
            {activeCreatorId && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="creatorprofile">
                  <CreatorProfileScreen />
                </ScreenScope>
              </div>
            )}

            {/* QR code — pushed on top of Creator Profile from its share icon */}
            {qrCodeOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-40 bg-surface">
                <ScreenScope id="qrcode">
                  <QrCodeScreen />
                </ScreenScope>
              </div>
            )}

            {/* filter bottom-sheet — opened from the Beranda tag row */}
            {filterOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30">
                <FilterModal onClose={closeFilter} onApply={applyFilter} />
              </div>
            )}

            {/* notification page — opened from the bell icon in the header */}
            {notifOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="notification">
                  <NotificationScreen />
                </ScreenScope>
              </div>
            )}

            {/* gem balance / missions page — opened from the gem pill in the header */}
            {gemsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="gems">
                  <GemScreen />
                </ScreenScope>
              </div>
            )}

            {/* gem history — pushed on top of the gems page from "Riwayat Gem-mu" */}
            {gemsOpen && gemHistoryOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="gemhistory">
                  <GemHistoryScreen />
                </ScreenScope>
              </div>
            )}

            {/* MêLy Club / Gem purchase — reachable from multiple screens */}
            {purchaseOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="purchase">
                  <PurchaseScreen />
                </ScreenScope>
              </div>
            )}

            {/* active sessions — pushed on top of Profile from its account Opsi sheet */}
            {devicesOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="devices">
                  <DevicesScreen />
                </ScreenScope>
              </div>
            )}

            {/* Kelola akun — pushed on top of Profile from its pill button or the account Opsi sheet */}
            {accountOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="account">
                  <AccountScreen />
                </ScreenScope>
              </div>
            )}

            {/* Karaktermu — pushed on top of Profile from its "Karakter saya" row */}
            {myCharactersOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="mycharacters">
                  <MyCharactersScreen />
                </ScreenScope>
              </div>
            )}

            {/* Mengikuti — pushed on top of Profile from its "Mengikuti" row */}
            {followingOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="following">
                  <FollowingScreen />
                </ScreenScope>
              </div>
            )}

            {/* Lencana — pushed on top of Profile from its badge pill */}
            {badgesOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="badges">
                  <BadgesScreen />
                </ScreenScope>
              </div>
            )}

            {/* Tampilan — pushed on top of Profile from its "Tampilan & bahasa" row */}
            {appearanceOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="appearance">
                  <AppearanceScreen />
                </ScreenScope>
              </div>
            )}

            {/* Pengaturan — pushed on top of Profile from its "Pengaturan" row */}
            {settingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="settings">
                  <SettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Notifikasi settings — pushed on top of Pengaturan from its "Notifikasi" row */}
            {settingsOpen && notificationSettingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="notificationsettings">
                  <NotificationSettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Video settings — pushed on top of Pengaturan from its "Video" row */}
            {settingsOpen && videoSettingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="videosettings">
                  <VideoSettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Tentang Kami — pushed on top of Profile from its support row */}
            {aboutOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-surface">
                <ScreenScope id="about">
                  <AboutScreen />
                </ScreenScope>
              </div>
            )}

            {/* Verifikasi email — pushed on top of Kelola akun from its Verifikasi Akun
                sheet or directly from the "Email" row */}
            {accountOpen && verifyEmailOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="verifyemail">
                  <VerifyEmailScreen />
                </ScreenScope>
              </div>
            )}

            {/* Nama Pengguna — pushed on top of Kelola akun from its "Nama Pengguna" row */}
            {accountOpen && usernameOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="username">
                  <UsernameScreen />
                </ScreenScope>
              </div>
            )}

            {/* Hapus akun — pushed on top of Kelola akun from its "Hapus akun imely" link */}
            {accountOpen && deleteAccountOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-surface">
                <ScreenScope id="deleteaccount">
                  <DeleteAccountScreen />
                </ScreenScope>
              </div>
            )}

            {/* Buat/Edit Karakter — always-on-top overlay reachable from the header
                "+" icon, Karaktermu's "Buat Karakter" button, or its Opsi sheet's
                "Edit Karakter" row; not scoped under any one page's overlay chain */}
            {characterFormOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-40 bg-surface">
                <ScreenScope id="characterform">
                  <CharacterFormScreen />
                </ScreenScope>
              </div>
            )}

            {/* Profile's account Opsi sheet — opened from its three-dot button */}
            {profileMenuOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30">
                <ProfileMenuSheet
                  open={profileMenuOpen}
                  onClose={closeProfileMenu}
                  onKelolaAkun={() => {
                    closeProfileMenu()
                    openAccount()
                  }}
                  onPerangkatMasuk={() => {
                    closeProfileMenu()
                    openDevices()
                  }}
                />
              </div>
            )}

            {/* avatar "change photo" sheet — opened from the camera badge on the
                avatar, on either the Profile tab or your own Creator Profile */}
            {avatarMenuOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-40">
                <AvatarMenuSheet
                  open={avatarMenuOpen}
                  onClose={closeAvatarMenu}
                  onTakePhoto={() => {
                    closeAvatarMenu()
                    showToast('Ambil foto — segera hadir')
                  }}
                  onChooseGallery={() => {
                    closeAvatarMenu()
                    showToast('Pilih foto dari galeri — segera hadir')
                  }}
                  onViewPhoto={() => {
                    closeAvatarMenu()
                    showToast('Lihat avatar — segera hadir')
                  }}
                  onManageAccount={() => {
                    closeAvatarMenu()
                    openAccount()
                  }}
                />
              </div>
            )}

            {/* stub-action toast, anchored to the phone frame not the browser viewport */}
            {toast && <ToastBubble text={toast} style={toastAreaStyle} />}

            {/* toast-only string preview — shown when the selected key has no
                persistent DOM element to outline (see useStringHighlighter's
                toastPreview), so a translator can still see it rendered in
                context instead of nothing happening on selection */}
            {!toast && toastPreviewText && <ToastBubble text={toastPreviewText} style={toastAreaStyle} />}

            {/* one-time warm-up pass so the Inspector's counts are accurate
                immediately — covers the brief flicker through every screen */}
            {priming && (
              <div className="absolute inset-0 z-50 bg-surface flex items-center justify-center">
                <div className="text-[12.5px] text-muted">Preparing preview…</div>
              </div>
            )}
          </PhoneFrame>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
