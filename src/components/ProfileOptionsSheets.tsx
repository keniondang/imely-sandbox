import { Lock, UserPlus, UserMinus, Ban, Flag } from 'lucide-react'
import { Str } from './Str'
import { ZoneScope } from '../context/ScreenScope'

const REPORT_REASONS = [
  'report_news.obscene_content',
  'report_news.illegal_content',
  'report_news.bad_rumors_content',
  'report_news.report_issue',
]

interface ProfileOptionsSheetsProps {
  targetName: string
  optionsOpen: boolean
  onCloseOptions: () => void
  following: boolean
  onToggleFollow: () => void
  onOpenBlockConfirm: () => void
  onOpenReport: () => void
  blockConfirmOpen: boolean
  onCloseBlockConfirm: () => void
  onConfirmBlock: () => void
  reportOpen: boolean
  onCloseReport: () => void
  reportReason: string | null
  onSelectReportReason: (key: string) => void
  onSendReport: () => void
  onModerate: () => void
}

// The Opsi sheet, block-confirmation dialog, and report-reasons sheet — the
// same trio on both the character profile and the creator profile. State
// lives in hooks/useProfileOptions.ts; this component is just the markup.
export function ProfileOptionsSheets({
  targetName,
  optionsOpen,
  onCloseOptions,
  following,
  onToggleFollow,
  onOpenBlockConfirm,
  onOpenReport,
  blockConfirmOpen,
  onCloseBlockConfirm,
  onConfirmBlock,
  reportOpen,
  onCloseReport,
  reportReason,
  onSelectReportReason,
  onSendReport,
  onModerate,
}: ProfileOptionsSheetsProps) {
  return (
    <>
      {optionsOpen && (
        <ZoneScope zone="menu">
          <div className="absolute inset-0 z-10">
            <button onClick={onCloseOptions} aria-label="Close options" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
              <div className="text-center py-4 border-b border-imely-line font-bold text-[16px] text-imely-ink">
                <Str k="toolbar_menu.header" />
              </div>
              <button
                onClick={onModerate}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <Lock size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="profile_menu.censor_content" />
                </span>
              </button>
              <button
                onClick={onToggleFollow}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                {following ? (
                  <UserMinus size={17} className="text-imely-ink" />
                ) : (
                  <UserPlus size={17} className="text-imely-ink" />
                )}
                <span className="text-[14px] text-imely-ink">
                  <Str k={following ? 'toolbar_menu.unfollow' : 'toolbar_menu.follow'} />
                </span>
              </button>
              <button
                onClick={onOpenBlockConfirm}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <Ban size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="toolbar_menu.block" />
                </span>
              </button>
              <button
                onClick={onOpenReport}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
              >
                <Flag size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="toolbar_menu.report" />
                </span>
              </button>
              <div className="h-2" />
            </div>
          </div>
        </ZoneScope>
      )}

      {blockConfirmOpen && (
        <ZoneScope zone="block_confirm">
          <div className="absolute inset-0 z-20">
            <button
              onClick={onCloseBlockConfirm}
              aria-label="Close block confirmation"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5">
              <div className="font-bold text-[17px] text-imely-ink">
                <Str k="profile_menu.block_dialog_title" /> {targetName}?
              </div>
              <div className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                <Str k="profile_menu.block_dialog_msg" /> {targetName}.
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={onCloseBlockConfirm}
                  className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity"
                >
                  <Str k="profile_menu.block_dialog_btn_cancel" />
                </button>
                <button
                  onClick={onConfirmBlock}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="profile_menu.block_dialog_btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {reportOpen && (
        <ZoneScope zone="report">
          <div className="absolute inset-0 z-10">
            <button onClick={onCloseReport} aria-label="Close report" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
              <div className="text-center py-4 border-b border-imely-line font-bold text-[16px] text-imely-ink">
                <Str k="report_news.header" />
              </div>
              {REPORT_REASONS.map((key) => (
                <button
                  key={key}
                  onClick={() => onSelectReportReason(key)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                      reportReason === key ? 'border-imely-primary' : 'border-gray-300'
                    }`}
                  >
                    {reportReason === key && <span className="w-2.5 h-2.5 rounded-full bg-imely-primary" />}
                  </span>
                  <span className="text-[14px] text-imely-ink">
                    <Str k={key} />
                  </span>
                </button>
              ))}
              <div className="flex gap-2 p-4">
                <button
                  onClick={onCloseReport}
                  className="flex-1 border border-imely-line rounded-full py-2.5 font-semibold text-[13.5px] text-imely-ink active:scale-95 transition-transform"
                >
                  <Str k="report_news.btn_cancel" />
                </button>
                <button
                  onClick={onSendReport}
                  disabled={!reportReason}
                  className="flex-1 bg-imely-primary text-white rounded-full py-2.5 font-semibold text-[13.5px] active:scale-95 active:bg-imely-primaryDark transition-transform disabled:opacity-40"
                >
                  <Str k="report_news.btn_send" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </>
  )
}
