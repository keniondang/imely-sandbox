import { ArrowLeft } from 'lucide-react'
import { Str, RichStr } from '../components/Str'
import { useApp } from '../context/AppContext'

export function AboutScreen() {
  const { closeAbout, showToast } = useApp()

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeAbout}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="setting.app_info.about_us" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center mt-4">
          <div className="w-28 h-28 rounded-[28px] bg-imely-ink border-4 border-imely-primary flex items-center justify-center text-6xl">
            🐱
          </div>
        </div>
        <div className="text-center mt-4 font-extrabold text-[20px] text-ink">imely - v26.07.02</div>
        <div className="text-center text-[13px] text-muted mt-1">build - v536</div>

        <div className="text-[14px] text-ink leading-relaxed mt-6">
          <RichStr k="setting.app_info.description" />
        </div>

        <div className="mt-5 font-bold text-[15px] text-ink">
          <Str k="setting.app_info.contact_info" />
        </div>
        <div className="text-[14px] text-ink mt-1.5">
          <Str k="setting.app_info.contact_info_email" />
        </div>

        <div className="mt-5 font-bold text-[15px] text-ink">
          <Str k="setting.app_info.join_community" />
        </div>
        <div className="flex gap-2.5 mt-2.5">
          <button
            onClick={() => showToast('TikTok — segera hadir')}
            className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center text-[13px] font-bold active:scale-90 transition-transform"
          >
            TT
          </button>
          <button
            onClick={() => showToast('Discord — segera hadir')}
            className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold active:scale-90 transition-transform"
          >
            D
          </button>
        </div>
      </div>
    </div>
  )
}
