import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { Toggle } from '../components/Toggle'

export function NotificationSettingsScreen() {
  const { closeNotificationSettings } = useApp()
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeNotificationSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="setting_menu.noti" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="flex items-start justify-between pb-3 border-b border-imely-line gap-3">
          <div>
            <div className="text-[14.5px] text-imely-ink">
              <Str k="setting.noti_setting.setting_title" />
            </div>
            <div className="text-[12.5px] text-gray-400 mt-0.5">
              <Str k="setting.noti_setting.setting_msg" />
            </div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>
      </div>
    </div>
  )
}
