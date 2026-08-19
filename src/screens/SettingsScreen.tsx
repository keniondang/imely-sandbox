import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'

export function SettingsScreen() {
  const { closeSettings, openNotificationSettings, openVideoSettings } = useApp()

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeSettings}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="setting_menu.name" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-1 font-bold text-[14px] text-ink">
          <Str k="setting_menu.option" />
        </div>
        <button
          onClick={openNotificationSettings}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
        >
          <span className="text-[14px] text-ink">
            <Str k="setting_menu.noti" />
          </span>
          <ChevronRight size={16} className="text-faint" />
        </button>
        <button
          onClick={openVideoSettings}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
        >
          <span className="text-[14px] text-ink">
            <Str k="setting_menu.video" />
          </span>
          <ChevronRight size={16} className="text-faint" />
        </button>
      </div>
    </div>
  )
}
