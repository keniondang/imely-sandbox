import { useEffect, useState } from 'react'
import { PanelLeftOpen, PanelLeftClose, X } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import { ScreenScope } from './context/ScreenScope'
import { useStringHighlighter } from './hooks/useStringHighlighter'
import { useOpenScreen } from './hooks/useNavigateToString'
import { WARM_UP_SCREENS, WARM_UP_ZONES } from './sandbox/browseConfig'
import { PhoneFrame } from './components/shell/PhoneFrame'
import { Header } from './components/shell/Header'
import { BottomNav } from './components/shell/BottomNav'
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
import { Inspector } from './sandbox/Inspector'
import { TranslationPanel } from './sandbox/TranslationPanel'

function Shell() {
  const {
    currentScreen,
    inspectorOpen,
    setInspectorOpen,
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorName,
    filterOpen,
    closeFilter,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    purchaseOpen,
    profileMenuOpen,
    closeProfileMenu,
    devicesOpen,
    openDevices,
    accountOpen,
    openAccount,
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
    selectedKey,
    selectKey,
    requestPopup,
    toast,
  } = useApp()
  useStringHighlighter()
  const openScreen = useOpenScreen()

  // Visit every screen once behind a brief cover so the Inspector's key
  // counts are accurate from the start, instead of showing 0 until a
  // translator happens to open each overlay by hand first. Also briefly
  // opens each screen's own local popups/menus (WARM_UP_ZONES) the same
  // way — those live behind a button click inside the screen itself, so
  // mounting the screen alone never registers their strings.
  const [priming, setPriming] = useState(true)
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F4F5F7] overflow-hidden">
      {/* one shared title bar spanning the full window, split into
          color-matched segments so all three columns' content starts at the
          same y-offset instead of each panel carrying its own header height */}
      <div className="h-12 flex items-stretch shrink-0">
        {inspectorOpen && (
          <>
            <div className="w-[360px] shrink-0 bg-imely-ink border-b border-white/10 flex items-center px-3">
              <span className="text-[13px] font-semibold text-white">String Inspector</span>
            </div>
            <div className="w-[300px] shrink-0 bg-white border-b border-imely-line flex items-center justify-between px-3">
              <span className="text-[13px] font-semibold text-imely-ink">Terjemahan</span>
              {selectedKey && (
                <button
                  onClick={() => selectKey(null, null)}
                  title="Tutup panel terjemahan"
                  className="text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </>
        )}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-imely-line bg-white min-w-0">
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 shrink-0"
          >
            {inspectorOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <span className="text-[13px] font-semibold text-imely-ink truncate">imely localization sandbox</span>
          <span className="text-[11px] text-gray-400 truncate">— live UI preview, not the real app</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {inspectorOpen && (
          <>
            <Inspector />
            <TranslationPanel />
          </>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto">
          <PhoneFrame>
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
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white flex flex-col">
                <ScreenScope id="chatdetail">
                  <ChatDetailScreen />
                </ScreenScope>
              </div>
            )}

            {/* chat's Opsi page — pushed on top of chatdetail from its three-dot button */}
            {activeChat && chatOptionsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="chatoptions">
                  <ChatOptionsScreen />
                </ScreenScope>
              </div>
            )}

            {/* character profile — opened by tapping a character card in the feed */}
            {activeCharacterId && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="characterprofile">
                  <CharacterProfileScreen />
                </ScreenScope>
              </div>
            )}

            {/* creator profile — pushed on top of a character profile from its "Kreator" row, or
                reachable directly (e.g. Mengikuti's "Pencipta" tab) without a character underneath */}
            {activeCreatorName && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="creatorprofile">
                  <CreatorProfileScreen />
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
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="notification">
                  <NotificationScreen />
                </ScreenScope>
              </div>
            )}

            {/* gem balance / missions page — opened from the gem pill in the header */}
            {gemsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="gems">
                  <GemScreen />
                </ScreenScope>
              </div>
            )}

            {/* gem history — pushed on top of the gems page from "Riwayat Gem-mu" */}
            {gemsOpen && gemHistoryOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="gemhistory">
                  <GemHistoryScreen />
                </ScreenScope>
              </div>
            )}

            {/* MêLy Club / Gem purchase — reachable from multiple screens */}
            {purchaseOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="purchase">
                  <PurchaseScreen />
                </ScreenScope>
              </div>
            )}

            {/* active sessions — pushed on top of Profile from its account Opsi sheet */}
            {devicesOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="devices">
                  <DevicesScreen />
                </ScreenScope>
              </div>
            )}

            {/* Kelola akun — pushed on top of Profile from its pill button or the account Opsi sheet */}
            {accountOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="account">
                  <AccountScreen />
                </ScreenScope>
              </div>
            )}

            {/* Karaktermu — pushed on top of Profile from its "Karakter saya" row */}
            {myCharactersOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="mycharacters">
                  <MyCharactersScreen />
                </ScreenScope>
              </div>
            )}

            {/* Mengikuti — pushed on top of Profile from its "Mengikuti" row */}
            {followingOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="following">
                  <FollowingScreen />
                </ScreenScope>
              </div>
            )}

            {/* Lencana — pushed on top of Profile from its badge pill */}
            {badgesOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="badges">
                  <BadgesScreen />
                </ScreenScope>
              </div>
            )}

            {/* Tampilan — pushed on top of Profile from its "Tampilan & bahasa" row */}
            {appearanceOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="appearance">
                  <AppearanceScreen />
                </ScreenScope>
              </div>
            )}

            {/* Pengaturan — pushed on top of Profile from its "Pengaturan" row */}
            {settingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="settings">
                  <SettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Notifikasi settings — pushed on top of Pengaturan from its "Notifikasi" row */}
            {settingsOpen && notificationSettingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="notificationsettings">
                  <NotificationSettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Video settings — pushed on top of Pengaturan from its "Video" row */}
            {settingsOpen && videoSettingsOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="videosettings">
                  <VideoSettingsScreen />
                </ScreenScope>
              </div>
            )}

            {/* Tentang Kami — pushed on top of Profile from its support row */}
            {aboutOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white">
                <ScreenScope id="about">
                  <AboutScreen />
                </ScreenScope>
              </div>
            )}

            {/* Verifikasi email — pushed on top of Kelola akun from its Verifikasi Akun
                sheet or directly from the "Email" row */}
            {accountOpen && verifyEmailOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="verifyemail">
                  <VerifyEmailScreen />
                </ScreenScope>
              </div>
            )}

            {/* Nama Pengguna — pushed on top of Kelola akun from its "Nama Pengguna" row */}
            {accountOpen && usernameOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="username">
                  <UsernameScreen />
                </ScreenScope>
              </div>
            )}

            {/* Hapus akun — pushed on top of Kelola akun from its "Hapus akun imely" link */}
            {accountOpen && deleteAccountOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-30 bg-white">
                <ScreenScope id="deleteaccount">
                  <DeleteAccountScreen />
                </ScreenScope>
              </div>
            )}

            {/* Buat/Edit Karakter — always-on-top overlay reachable from the header
                "+" icon, Karaktermu's "Buat Karakter" button, or its Opsi sheet's
                "Edit Karakter" row; not scoped under any one page's overlay chain */}
            {characterFormOpen && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-40 bg-white">
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

            {/* stub-action toast, anchored to the phone frame not the browser viewport */}
            {toast && (!activeChat || chatOptionsOpen) && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-40 bg-imely-ink text-white text-[12.5px] font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
                {toast}
              </div>
            )}

            {/* one-time warm-up pass so the Inspector's counts are accurate
                immediately — covers the brief flicker through every screen */}
            {priming && (
              <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
                <div className="text-[12.5px] text-gray-400">Menyiapkan pratinjau…</div>
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
