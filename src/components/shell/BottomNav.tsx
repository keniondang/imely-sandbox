import { Home, Cat, User } from 'lucide-react'
import { useApp, type ScreenId } from '../../context/AppContext'
import { Str } from '../Str'
import { ScreenScope } from '../../context/ScreenScope'

const TABS: { id: ScreenId; icon: React.ReactNode; key: string }[] = [
  { id: 'feed', icon: <Home size={22} />, key: 'navigation.ask.subtab_ask.tab_name' },
  { id: 'chatlist', icon: <Cat size={22} />, key: 'navigation.noti.tab_name' },
  { id: 'profile', icon: <User size={22} />, key: 'navigation.me.tab_name' },
]

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp()

  return (
    <div className="flex items-center justify-around border-t border-imely-line py-2 shrink-0 bg-white">
      {TABS.map((tab) => {
        const active = currentScreen === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentScreen(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 active:scale-90 transition-transform ${
              active ? 'text-imely-primary' : 'text-gray-400'
            }`}
          >
            {tab.icon}
            <ScreenScope id={tab.id}>
              <Str k={tab.key} className="text-[11px] font-medium" />
            </ScreenScope>
          </button>
        )
      })}
    </div>
  )
}
