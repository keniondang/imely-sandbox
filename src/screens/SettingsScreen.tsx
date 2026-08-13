import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'

export function SettingsScreen() {
  const { closeSettings, openNotificationSettings, openVideoSettings } = useApp()

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeSettings}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="setting_menu.name" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-1 font-bold text-[14px] text-imely-ink">
          <Str k="setting_menu.option" />
        </div>
        <button
          onClick={openNotificationSettings}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
        >
          <span className="text-[14px] text-imely-ink">
            <Str k="setting_menu.noti" />
          </span>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
        <button
          onClick={openVideoSettings}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
        >
          <span className="text-[14px] text-imely-ink">
            <Str k="setting_menu.video" />
          </span>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  )
}
