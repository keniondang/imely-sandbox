import type { ReactNode } from 'react'

export const FRAME_WIDTH = 390
export const FRAME_HEIGHT = 780

// `scale` (Focus Mode uses ~0.72) shrinks the whole frame via a CSS
// transform rather than changing its width/height classes — every internal
// layout in the app is written against the real 390px frame, so scaling the
// already-laid-out box down visually keeps that intact instead of
// reflowing everything at a narrower width. The outer wrapper is sized to
// the SCALED footprint (transform alone doesn't shrink the box other
// elements lay out around) so the freed space actually goes somewhere.
export function PhoneFrame({ children, scale = 1 }: { children: ReactNode; scale?: number }) {
  return (
    <div style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}>
      <div
        className="w-[390px] max-w-full h-[780px] bg-surface rounded-[36px] shadow-2xl border border-line overflow-hidden flex flex-col relative"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* fake status bar */}
        <div className="h-11 flex items-center justify-between px-6 text-[13px] font-semibold text-ink shrink-0">
          <span>16:22</span>
          <span className="flex items-center gap-1 text-[11px] text-ink">📶 📡 🔋</span>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
