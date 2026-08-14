import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { ZoneScope } from '../context/ScreenScope'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'

const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_-]{3,31}$/

export function UsernameScreen() {
  const { closeUsername, setAccountUsername, showToast } = useApp()
  const [username, setUsername] = useState('')
  const [error, setError] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  usePopupRequest('username', 'discard_confirm', setConfirmDiscard)

  function handleBack() {
    if (username.trim().length > 0) {
      setConfirmDiscard(true)
      return
    }
    closeUsername()
  }

  function submit() {
    if (!USERNAME_RE.test(username)) {
      setError(true)
      return
    }
    setError(false)
    setAccountUsername(username)
    closeUsername()
    showToast('Nama pengguna berhasil dibuat')
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="relative flex items-center justify-center px-3 py-2.5 shrink-0">
        <button
          onClick={handleBack}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg bg-imely-ink flex items-center justify-center text-white text-sm">🐱</div>
      </div>

      <div className="text-center font-bold text-[18px] text-imely-ink mt-1">
        <Str k="account_info.change_user_name.title" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 mt-4">
        <div className="bg-imely-mint/40 rounded-xl p-3 text-[12.5px] text-imely-ink whitespace-pre-line leading-relaxed">
          <Str k="account_info.change_user_name.hint" />
        </div>

        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError(false)
          }}
          placeholder="Masukkan nama pengguna..."
          className="w-full mt-5 border-b border-imely-line pb-2 text-[14px] text-imely-ink outline-none focus:border-imely-primary placeholder:text-gray-400"
        />
        {error && (
          <div className="mt-1.5 text-[12px] text-red-500">
            <Str k="account_info.change_user_name.error_invalid_user_name" />
          </div>
        )}

        <button
          onClick={submit}
          className="mt-6 w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
        >
          <Str k="account_info.change_user_name.btn_create_username" />
        </button>
      </div>

      {confirmDiscard && (
        <ZoneScope zone="discard_confirm">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setConfirmDiscard(false)}
              aria-label="Close discard confirmation"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5">
              <div className="font-bold text-[16px] text-imely-ink">
                <Str k="account_info.change_user_name.cancel_dialog_title" />
              </div>
              <div className="mt-1.5 text-[13px] text-gray-500">
                <Str k="account_info.change_user_name.cancel_dialog_msg" />
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setConfirmDiscard(false)}
                  className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity"
                >
                  <Str k="account_info.change_user_name.cancel_dialog_btn_cancel" />
                </button>
                <button
                  onClick={() => {
                    setConfirmDiscard(false)
                    closeUsername()
                  }}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="account_info.change_user_name.cancel_dialog_btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}
