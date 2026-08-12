import type { ReactNode } from 'react'

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center py-6 px-4">
      <div className="w-[390px] max-w-full h-[780px] bg-white rounded-[36px] shadow-2xl border border-imely-line overflow-hidden flex flex-col relative">
        {/* fake status bar */}
        <div className="h-11 flex items-center justify-between px-6 text-[13px] font-semibold text-imely-ink shrink-0">
          <span>16:22</span>
          <span className="flex items-center gap-1 text-[11px] text-imely-ink">📶 📡 🔋</span>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
