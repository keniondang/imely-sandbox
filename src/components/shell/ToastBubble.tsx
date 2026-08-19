import type { CSSProperties } from 'react'
import { Check, AlertTriangle } from 'lucide-react'

// Shared visual for every toast shown in the live preview — both the real
// stub-action toasts (App.tsx's `toast` state) and the toast-preview bubble
// shown when a selected string has no persistent DOM element to outline
// (see useStringHighlighter.ts's toastPreview). One look for both, so a
// translator can't tell "real" and "previewed" toasts apart by styling.
//
// `variant: 'warning'` is a separate case — a selected key that isn't wired
// anywhere at all (see unwiredAlertKey), which isn't a toast preview of
// anything real, so it gets its own amber styling rather than borrowing the
// green success look.
export function ToastBubble({
  text,
  style,
  variant = 'success',
}: {
  text: string
  style?: CSSProperties
  variant?: 'success' | 'warning'
}) {
  const isWarning = variant === 'warning'
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 text-white text-[13.5px] font-medium rounded-2xl pl-3 pr-4 py-2.5 shadow-lg pointer-events-none max-w-[85%] ${
        isWarning ? 'bg-amber-600/95' : 'bg-black/80'
      }`}
      style={style}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          isWarning ? 'bg-white/20' : 'bg-imely-primary'
        }`}
      >
        {isWarning ? (
          <AlertTriangle size={12} className="text-white" strokeWidth={2.5} />
        ) : (
          <Check size={12} className="text-white" strokeWidth={3} />
        )}
      </span>
      <span className="leading-snug">{text}</span>
    </div>
  )
}
