import { Lock, UserPlus, UserMinus, Ban, Flag } from 'lucide-react'
import { Str } from './Str'
import { ZoneScope } from '../context/ScreenScope'

const REPORT_REASONS = [
  'report_news.obscene_content',
  'report_news.illegal_content',
  'report_news.bad_rumors_content',
  'report_news.report_issue',
]

// Three pieces of the same Opsi/Block/Report interaction, split apart so a
// screen can compose only what it needs — a profile screen shows all three
// (its 3-dot button opens the Opsi sheet, which links to the other two), but
// a chat's Opsi page already lists Blokir/Laporkan as rows directly and only
// needs BlockConfirmDialog + ReportReasonsSheet. State/handlers for all three
// come from hooks/useProfileOptions.ts.

interface OpsiMenuSheetProps {
  optionsOpen: boolean
  onClose: () => void
  following: boolean
  onToggleFollow: () => void
  onOpenBlockConfirm: () => void
  onOpenReport: () => void
  onModerate: () => void
}

export function OpsiMenuSheet({
  optionsOpen,
  onClose,
  following,
  onToggleFollow,
  onOpenBlockConfirm,
  onOpenReport,
  onModerate,
}: OpsiMenuSheetProps) {
  if (!optionsOpen) return null
  return (
    <ZoneScope zone="menu">
      <div className="absolute inset-0 z-10">
        <button onClick={onClose} aria-label="Close options" className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl">
          <div className="text-center py-4 border-b border-line font-bold text-[16px] text-ink">
            <Str k="toolbar_menu.header" />
          </div>
          <button
            onClick={onModerate}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <Lock size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="profile_menu.censor_content" />
            </span>
          </button>
          <button
            onClick={onToggleFollow}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            {following ? (
              <UserMinus size={17} className="text-ink" />
            ) : (
              <UserPlus size={17} className="text-ink" />
            )}
            <span className="text-[14px] text-ink">
              <Str k={following ? 'toolbar_menu.unfollow' : 'toolbar_menu.follow'} />
            </span>
          </button>
          <button
            onClick={onOpenBlockConfirm}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <Ban size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="toolbar_menu.block" />
            </span>
          </button>
          <button
            onClick={onOpenReport}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-subtle transition-colors text-left"
          >
            <Flag size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="toolbar_menu.report" />
            </span>
          </button>
          <div className="h-2" />
        </div>
      </div>
    </ZoneScope>
  )
}

interface BlockConfirmDialogProps {
  targetName: string
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BlockConfirmDialog({ targetName, open, onClose, onConfirm }: BlockConfirmDialogProps) {
  if (!open) return null
  return (
    <ZoneScope zone="block_confirm">
      <div className="absolute inset-0 z-20">
        <button onClick={onClose} aria-label="Close block confirmation" className="absolute inset-0 bg-black/40" />
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-surface rounded-2xl p-5">
          <div className="font-bold text-[17px] text-ink">
            <Str k="profile_menu.block_dialog_title" /> {targetName}?
          </div>
          <div className="mt-2 text-[13px] text-muted leading-relaxed">
            <Str k="profile_menu.block_dialog_msg" /> {targetName}.
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <button onClick={onClose} className="font-semibold text-[14px] text-ink active:opacity-70 transition-opacity">
              <Str k="profile_menu.block_dialog_btn_cancel" />
            </button>
            <button
              onClick={onConfirm}
              className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
            >
              <Str k="profile_menu.block_dialog_btn_confirm" />
            </button>
          </div>
        </div>
      </div>
    </ZoneScope>
  )
}

interface ReportReasonsSheetProps {
  open: boolean
  onClose: () => void
  reason: string | null
  onSelectReason: (key: string) => void
  onSend: () => void
}

export function ReportReasonsSheet({ open, onClose, reason, onSelectReason, onSend }: ReportReasonsSheetProps) {
  if (!open) return null
  return (
    <ZoneScope zone="report">
      <div className="absolute inset-0 z-10">
        <button onClick={onClose} aria-label="Close report" className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl">
          <div className="text-center py-4 border-b border-line font-bold text-[16px] text-ink">
            <Str k="report_news.header" />
          </div>
          {REPORT_REASONS.map((key) => (
            <button
              key={key}
              onClick={() => onSelectReason(key)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                  reason === key ? 'border-imely-primary' : 'border-line'
                }`}
              >
                {reason === key && <span className="w-2.5 h-2.5 rounded-full bg-imely-primary" />}
              </span>
              <span className="text-[14px] text-ink">
                <Str k={key} />
              </span>
            </button>
          ))}
          <div className="flex gap-2 p-4">
            <button
              onClick={onClose}
              className="flex-1 border border-line rounded-full py-2.5 font-semibold text-[13.5px] text-ink active:scale-95 transition-transform"
            >
              <Str k="report_news.btn_cancel" />
            </button>
            <button
              onClick={onSend}
              disabled={!reason}
              className="flex-1 bg-imely-primary text-white rounded-full py-2.5 font-semibold text-[13.5px] active:scale-95 active:bg-imely-primaryDark transition-transform disabled:opacity-40"
            >
              <Str k="report_news.btn_send" />
            </button>
          </div>
        </div>
      </div>
    </ZoneScope>
  )
}
