import { ArrowLeft, Smartphone, Info } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { MOCK_USER, MOCK_DEVICES, ph } from '../data/mockContent'

export function DevicesScreen() {
  const { closeDevices, showToast, baseLocale } = useApp()

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeDevices}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="profile_me_v4.menu.login_managment" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-start gap-2 bg-sky-50 text-sky-900 rounded-xl p-3 text-[13px] leading-relaxed">
          <Info size={16} className="shrink-0 mt-0.5 text-sky-500" />
          <Str k="active_session.warning_limit_login" />
        </div>

        <div className="mt-4 text-[13.5px] text-imely-ink">
          <Str k="active_session.text_account" /> <span className="font-bold">{ph(MOCK_USER.name, baseLocale)}</span>{' '}
          <Str k="active_session.text_logging_in" /> {MOCK_DEVICES.length} <Str k="active_session.text_device" />
        </div>

        <div className="mt-4">
          {MOCK_DEVICES.map((d) => (
            <div key={d.id} className="flex gap-3 py-3.5 border-b border-imely-line last:border-0">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-imely-ink" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[14px] text-imely-ink">
                  {d.name}
                  {d.current && (
                    <>
                      {' '}
                      (<Str k="active_session.text_using" />)
                    </>
                  )}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">
                  <Str k="active_session.text_logged_in" />: {d.loginDate} <Str k="active_session.text_when_hour" />{' '}
                  {d.loginTime}
                </div>
                <div className="text-[12px] text-gray-500">{d.city}</div>
                {!d.current && (
                  <button
                    onClick={() => showToast('Hapus dan keluar — segera hadir')}
                    className="mt-1.5 text-[12px] font-semibold text-red-500 bg-red-50 rounded-full px-3 py-1 active:scale-95 transition-transform"
                  >
                    <Str k="active_session.text_remove_logout" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
