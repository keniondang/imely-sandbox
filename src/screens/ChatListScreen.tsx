import { MOCK_FEED_CHARACTERS, ph } from '../data/mockContent'
import { useApp } from '../context/AppContext'

// Same character line-up as Beranda's grid — a chat thread here is just that
// same character with a conversation already started, so pressing it should
// drop straight into the chat (not the profile page, unlike the feed card).
const PLACEHOLDER_DATES = ['07/08/2026', '06/08/2026', '05/08/2026', '04/08/2026']

export function ChatListScreen() {
  const { openChat, baseLocale } = useApp()

  return (
    <div className="pb-6">
      {MOCK_FEED_CHARACTERS.map((c, i) => (
        <button
          key={c.id}
          onClick={() => openChat({ id: c.id, name: c.name, color: c.color })}
          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-imely-line last:border-0 text-left active:bg-gray-100 transition-colors ${
            i === 0 ? 'bg-imely-mint/40' : ''
          }`}
        >
          <div className="w-12 h-12 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14.5px] text-imely-ink truncate">{ph(c.name, baseLocale)}</div>
            <div className="text-[13px] text-gray-500 truncate">{ph(c.firstMessage, baseLocale).replace(/\n/g, ' ')}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-[11px] text-gray-400">{PLACEHOLDER_DATES[i] ?? PLACEHOLDER_DATES[0]}</div>
            {i === 0 ? (
              <div className="w-4 h-4 rounded-full bg-imely-pink text-white text-[10px] flex items-center justify-center">
                1
              </div>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  )
}
