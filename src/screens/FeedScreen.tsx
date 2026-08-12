import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { Str } from '../components/Str'
import { MOCK_FEED_CHARACTERS, FILTER_CATEGORIES } from '../data/mockContent'
import { useApp } from '../context/AppContext'

const SUBTABS = [
  { id: 's1', key: 'navigation.ask.subtab_ask.tab_name' },
  { id: 's2', key: 'companion_discover.tab_name_1' },
  { id: 's3', key: 'navigation.community.subtab_101.tab_name' },
]

export function FeedScreen() {
  const { openChat, openFilter } = useApp()
  const [activeTab, setActiveTab] = useState('s1')
  const [tagsExpanded, setTagsExpanded] = useState(false)

  return (
    <div className="pb-6">
      {/* subtabs — real strings, not touched */}
      <div className="flex items-center gap-5 px-4 pt-1 border-b border-imely-line">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2 text-[15px] font-semibold active:opacity-60 transition-opacity ${
              activeTab === t.id
                ? 'text-imely-ink border-b-2 border-imely-primary'
                : 'text-gray-400'
            }`}
          >
            <Str k={t.key} />
          </button>
        ))}
      </div>

      {/* filter button + tag row (collapsible) + expand toggle */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={openFilter}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 self-start active:scale-90 transition-transform"
        >
          <SlidersHorizontal size={14} />
        </button>

        <div
          className={
            tagsExpanded
              ? 'flex flex-wrap gap-2 flex-1'
              : 'flex gap-2 flex-1 overflow-x-auto flex-nowrap'
          }
        >
          {FILTER_CATEGORIES.map((tag) => (
            <span
              key={tag}
              className="shrink-0 bg-gray-100 rounded-full px-3 py-1.5 text-[13px] font-medium text-imely-ink whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => setTagsExpanded((v) => !v)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 self-start active:scale-90 transition-transform"
        >
          {tagsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* section title */}
      <div className="px-4 mt-1 mb-2 font-extrabold text-[16px] text-imely-ink flex items-center gap-1">
        ✨ Gebetan Baru!
      </div>

      {/* card grid — tappable, opens chat with that character */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {MOCK_FEED_CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => openChat({ id: c.id, name: c.name, color: c.color })}
            className="rounded-2xl overflow-hidden border border-imely-line bg-white text-left active:scale-[0.97] transition-transform"
          >
            <div className="h-36 flex items-end p-2" style={{ backgroundColor: c.color }}>
              <div className="bg-black/40 text-white text-[11px] rounded-full px-2 py-0.5 flex items-center gap-1">
                <MessageCircle size={11} />
                {c.chatCount}
              </div>
            </div>
            <div className="p-2.5">
              <div className="font-bold text-[14px] text-imely-ink">{c.name}</div>
              <div className="text-[12px] text-gray-500 line-clamp-2 mt-0.5">{c.tagline}</div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {c.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
