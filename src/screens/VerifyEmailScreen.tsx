import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str, RichStr, useStrAttrs } from '../components/Str'
import { useApp } from '../context/AppContext'
import { resolveString } from '../lib/strings'

export function VerifyEmailScreen() {
  const { closeVerifyEmail, showToast, baseLocale } = useApp()
  const emailHintAttrs = useStrAttrs('login.update_email.tb_input_email_hint')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)

  const canContinue = email.trim().length > 0 && agreed

  function submit() {
    if (!canContinue) return
    closeVerifyEmail()
    showToast('Kode verifikasi dikirim — segera hadir')
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center justify-center px-3 py-2.5 shrink-0">
        <button
          onClick={closeVerifyEmail}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg bg-imely-ink flex items-center justify-center text-white text-sm">🐱</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="text-center text-[17px] text-ink mt-1">
          <Str k="login.update_email.title" />
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={resolveString('login.update_email.tb_input_email_hint', baseLocale)}
          className="w-full mt-6 border-b border-line pb-2 text-[14px] text-ink outline-none focus:border-imely-primary placeholder:text-muted"
          {...emailHintAttrs}
        />

        <button
          onClick={() => setAgreed((v) => !v)}
          className="w-full flex items-start gap-2.5 mt-5 text-left"
        >
          <span
            className={`w-[18px] h-[18px] rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
              agreed ? 'border-imely-primary bg-imely-primary' : 'border-line'
            }`}
          >
            {agreed && <span className="w-2 h-2 rounded-full bg-surface" />}
          </span>
          <span className="text-[12.5px] text-muted leading-relaxed">
            <RichStr k="login.create_acc_by_email.confirm_policy" />
          </span>
        </button>

        <button
          onClick={submit}
          disabled={!canContinue}
          className="mt-6 w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform disabled:opacity-30"
        >
          <Str k="login.update_email.btn_next" />
        </button>
      </div>
    </div>
  )
}
