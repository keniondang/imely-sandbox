import { Bell, Search, Plus, Gem } from 'lucide-react'
import { MOCK_USER } from '../../data/mockContent'
import { useApp } from '../../context/AppContext'

export function Header() {
  const { openNotif, openGems } = useApp()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-imely-ink flex items-center justify-center text-white text-sm">
          🐱
        </div>
        <span className="font-extrabold text-lg text-imely-ink tracking-tight">imely</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openGems}
          className="flex items-center gap-1 bg-imely-mint rounded-full px-3 py-1.5 text-sm font-semibold text-imely-primaryDark active:scale-95 active:bg-imely-mintDeep transition-transform"
        >
          <Gem size={14} className="text-sky-400" />
          {MOCK_USER.gems.toLocaleString('id-ID')}
        </button>
        <IconButton icon={<Bell size={16} />} onClick={openNotif} />
        <IconButton icon={<Search size={16} />} />
        <IconButton icon={<Plus size={16} />} />
      </div>
    </div>
  )
}

function IconButton({ icon, onClick }: { icon: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-200 transition-transform"
    >
      {icon}
    </button>
  )
}
