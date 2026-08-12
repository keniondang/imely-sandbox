import { MOCK_CHAT_THREADS } from '../data/mockContent'
import { useApp } from '../context/AppContext'

export function ChatListScreen() {
  const { openChat } = useApp()

  return (
    <div className="pb-6">
      {MOCK_CHAT_THREADS.map((t) => (
        <button
          key={t.id}
          onClick={() => openChat({ id: t.id, name: t.name, color: t.color })}
          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-imely-line last:border-0 text-left active:bg-gray-100 transition-colors ${
            t.unread ? 'bg-imely-mint/40' : ''
          }`}
        >
          <div
            className="w-12 h-12 rounded-full shrink-0"
            style={{ backgroundColor: t.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14.5px] text-imely-ink truncate">{t.name}</div>
            <div className="text-[13px] text-gray-500 truncate">{t.preview}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-[11px] text-gray-400">{t.date}</div>
            {t.unread ? (
              <div className="w-4 h-4 rounded-full bg-imely-pink text-white text-[10px] flex items-center justify-center">
                {t.unread}
              </div>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  )
}
