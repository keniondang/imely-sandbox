import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { Toggle } from '../components/Toggle'

export function VideoSettingsScreen() {
  const { closeVideoSettings } = useApp()
  const [autoplay, setAutoplay] = useState(true)

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeVideoSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink shrink-0 active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="setting.video_setting.header" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="text-[14.5px] text-ink">
            <Str k="setting.video_setting.title" />
          </div>
          <Toggle checked={autoplay} onChange={setAutoplay} />
        </div>
      </div>
    </div>
  )
}
