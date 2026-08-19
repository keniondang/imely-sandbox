import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str, useRegisterKeys } from '../components/Str'
import { ZoneScope } from '../context/ScreenScope'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { resolveString } from '../lib/strings'

// The confirm button below intentionally renders whatever the real
// `profile_me.deactivate.btn_confirm` key resolves to, even though it's the
// same long sentence as the warning intro above it (and overflows its own
// pill) — that's the actual xlsx content, not a bug in this sandbox. Seeing
// it truncated here is exactly the kind of thing this tool exists to surface
// to a translator/QA pass.
export function DeleteAccountScreen() {
  const { closeDeleteAccount, baseLocale, showToast } = useApp()
  useRegisterKeys(['profile_me.deactivate.deactivate_success_toast'])
  const [confirmOpen, setConfirmOpen] = useState(false)
  usePopupRequest('deleteaccount', 'delete_account_confirm', setConfirmOpen)

  return (
    <div className="h-full flex flex-col bg-surface relative">
      <div className="relative flex items-center gap-2 px-3 py-2.5 shrink-0">
        <button
          onClick={closeDeleteAccount}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink shrink-0 active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="profile_me.deactivate.header" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[13px] font-bold flex items-center justify-center shrink-0">
            !
          </span>
          <span className="font-bold text-[16px] text-ink">
            <Str k="profile_me.deactivate.warning_title" />
          </span>
        </div>

        <div className="mt-3 text-[14.5px] text-ink">
          <Str k="profile_me.deactivate.warning_sub_title_aihay" />
        </div>

        <ul className="mt-3 space-y-3">
          <li className="flex gap-2 text-[14px] text-ink leading-relaxed">
            <span className="shrink-0">•</span>
            <Str k="profile_me.deactivate.warning_msg_1" />
          </li>
          <li className="flex gap-2 text-[14px] text-ink leading-relaxed">
            <span className="shrink-0">•</span>
            <Str k="profile_me.deactivate.warning_msg_2" />
          </li>
          <li className="flex gap-2 text-[14px] text-ink leading-relaxed">
            <span className="shrink-0">•</span>
            <Str k="profile_me.deactivate.warning_msg_3" />
          </li>
        </ul>

        <div className="mt-4 border-t border-line pt-4 font-bold text-[16px] text-ink">
          <Str k="profile_me.deactivate.confirm_title" />
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={closeDeleteAccount}
            className="flex-1 border border-line rounded-full py-3 font-bold text-[13.5px] text-ink active:scale-[0.97] transition-transform"
          >
            <Str k="profile_me.deactivate.btn_cancel" />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex-1 bg-red-500 text-white rounded-full py-3 font-bold text-[13.5px] truncate px-4 active:scale-[0.97] active:bg-red-600 transition-transform"
          >
            <Str k="profile_me.deactivate.btn_confirm" />
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ZoneScope zone="delete_account_confirm">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setConfirmOpen(false)}
              aria-label="Close delete confirmation"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-surface rounded-2xl p-5">
              <div className="font-bold text-[16px] text-ink">
                <Str k="profile_me.deactivate.confirm_dialog_aihay_title" />
              </div>
              <div className="mt-1.5 text-[13px] text-muted leading-relaxed">
                <Str k="profile_me.deactivate.confirm_dialog_aihay_msg" />
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="font-semibold text-[14px] text-ink active:opacity-70 transition-opacity"
                >
                  <Str k="profile_me.deactivate.confirm_dialog_btn_cancel" />
                </button>
                <button
                  onClick={() => {
                    setConfirmOpen(false)
                    closeDeleteAccount()
                    showToast(resolveString('profile_me.deactivate.deactivate_success_toast', baseLocale))
                  }}
                  className="font-semibold text-[14px] text-red-500 active:opacity-70 transition-opacity"
                >
                  <Str k="profile_me.deactivate.confirm_dialog_btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}
