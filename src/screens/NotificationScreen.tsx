import { useState } from 'react'
import { ArrowLeft, ChevronRight, MoreVertical, X, Mail, Trash2 } from 'lucide-react'
import { Str } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { useApp } from '../context/AppContext'
import { ZoneScope } from '../context/ScreenScope'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { MOCK_NOTIFICATIONS } from '../data/mockContent'

export function NotificationScreen() {
  const { closeNotif } = useApp()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [optionsFor, setOptionsFor] = useState<string | null>(null)

  usePopupRequest('notification', 'menu', (open) => {
    setOptionsFor(open ? notifications[0]?.id ?? null : null)
  })

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setOptionsFor(null)
  }

  function deleteNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setOptionsFor(null)
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* header */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeNotif}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[17px] text-ink">
          <Str k="navigation.noti.subtab_home.noti_all_tab_name" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* placeholder promo banner */}
        <button className="w-full flex items-center justify-between bg-imely-mint px-4 py-3 active:bg-imely-mintDeep transition-colors">
          <span className="text-[13.5px] font-semibold text-imely-primaryDark">
            📢 <NoSheet>Pemberitahuan dari imely</NoSheet>
          </span>
          <ChevronRight size={16} className="text-imely-primaryDark" />
        </button>

        <div className="px-4 pt-4 pb-2 font-bold text-[15px] text-ink">
          <Str k="navigation.noti.subtab_home.tab_name_1" />
        </div>

        <div className="bg-sky-50/70">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-white ${
                n.read ? 'bg-transparent' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full border-2 border-imely-primary overflow-hidden shrink-0">
                <img src="/download.png" alt="imely" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] text-ink leading-snug">{n.text}</div>
                <div className="text-[11px] text-muted mt-1">{n.time}</div>
              </div>
              <button
                onClick={() => setOptionsFor(n.id)}
                className="text-muted shrink-0 active:scale-90 transition-transform p-1"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center text-[13px] text-muted py-10">
              <Str k="noti_list.empty_list" />
            </div>
          )}
        </div>
      </div>

      {/* Opsi bottom sheet for the selected notification */}
      {optionsFor && (
        <ZoneScope zone="menu">
          <div className="absolute inset-0">
            <button
              onClick={() => setOptionsFor(null)}
              aria-label="Close options"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl">
              <div className="relative flex items-center justify-center px-4 py-4 border-b border-line">
                <div className="font-bold text-[16px] text-ink">
                  <Str k="menu.noti_option_menu.header" />
                </div>
                <button
                  onClick={() => setOptionsFor(null)}
                  className="absolute right-4 text-muted active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>

              <button
                onClick={() => markAsRead(optionsFor)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors"
              >
                <Mail size={17} className="text-ink" />
                <span className="text-[14px] text-ink">
                  <Str k="menu.noti_option_menu.mark_as_read" />
                </span>
              </button>

              <button
                onClick={() => deleteNotif(optionsFor)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-subtle transition-colors"
              >
                <Trash2 size={17} className="text-ink" />
                <span className="text-[14px] text-ink">
                  <Str k="menu.noti_option_menu.delete_noti" />
                </span>
              </button>

              <div className="h-2" />
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}
