import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import { ScreenScope } from './context/ScreenScope'
import { useStringHighlighter } from './hooks/useStringHighlighter'
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
import { Inspector } from './sandbox/Inspector'

function Shell() {
  const {
    currentScreen,
    inspectorOpen,
    setInspectorOpen,
    activeChat,
    filterOpen,
    closeFilter,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    toast,
  } = useApp()
  useStringHighlighter()

  function applyFilter() {
    closeFilter()
  }

  return (
    <div className="h-screen w-screen flex bg-[#F4F5F7] overflow-hidden">
      {inspectorOpen && <Inspector />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 flex items-center gap-3 px-4 border-b border-imely-line bg-white shrink-0">
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            {inspectorOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <span className="text-[13px] font-semibold text-imely-ink">imely localization sandbox</span>
          <span className="text-[11px] text-gray-400">— live UI preview, not the real app</span>
        </div>

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

            {/* full-screen chat overlay — opened by tapping a thread or character card */}
            {activeChat && (
              <div className="absolute top-11 right-0 bottom-0 left-0 z-20 bg-white flex flex-col">
                <ScreenScope id="chatdetail">
                  <ChatDetailScreen />
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

            {/* stub-action toast, anchored to the phone frame not the browser viewport */}
            {toast && !activeChat && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-40 bg-imely-ink text-white text-[12.5px] font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
                {toast}
              </div>
            )}
          </PhoneFrame>
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
