import { useState } from 'react'
import { ArrowLeft, MoreVertical, Send } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { resolveString } from '../lib/strings'

interface Bubble {
  id: string
  from: 'me' | 'bot'
  text: string
}

const CANNED_REPLIES = [
  'Hehe, kamu selalu tau apa yang harus dibilang.',
  'Ceritain lebih lanjut dong, aku dengerin kok.',
  'Wah, seru juga ya. Terus gimana?',
]

export function ChatDetailScreen() {
  const { activeChat, closeChat, locale } = useApp()
  const [input, setInput] = useState('')
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { id: 'b0', from: 'bot', text: 'Hai! Lagi ngapain kamu?' },
  ])
  const [typing, setTyping] = useState(false)

  if (!activeChat) return null

  function send() {
    if (!input.trim()) return
    const mine: Bubble = { id: crypto.randomUUID(), from: 'me', text: input.trim() }
    setBubbles((prev) => [...prev, mine])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)]
      setBubbles((prev) => [...prev, { id: crypto.randomUUID(), from: 'bot', text: reply }])
      setTyping(false)
    }, 700)
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeChat}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-9 h-9 rounded-full shrink-0"
          style={{ backgroundColor: activeChat.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[14.5px] text-imely-ink truncate">{activeChat.name}</div>
          <div className="text-[11px] text-imely-primary">Online</div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* disclaimer banner — real strings */}
      <div className="mx-3 mt-2 rounded-xl bg-gray-50 px-3 py-2 shrink-0">
        <div className="text-[11px] font-semibold text-imely-ink">
          <Str k="chat.bot_disclaimer_banner.title" />
        </div>
        <div className="text-[10.5px] text-gray-400 mt-0.5">
          <Str k="chat.bot_disclaimer_banner.subtitle" />
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {bubbles.map((b) => (
          <div key={b.id} className={`flex ${b.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13.5px] ${
                b.from === 'me'
                  ? 'bg-imely-primary text-white rounded-br-sm'
                  : 'bg-gray-100 text-imely-ink rounded-bl-sm'
              }`}
            >
              {b.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-[13.5px] text-gray-400">
              ...
            </div>
          </div>
        )}
      </div>

      {/* input bar — real placeholder string */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-imely-line shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={resolveString('chat.input_box_hint', locale)}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13.5px] outline-none"
        />
        <button
          onClick={send}
          className="w-10 h-10 rounded-full bg-imely-primary text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-40"
          disabled={!input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
