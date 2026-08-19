import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { Str } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { MOCK_FEED_CHARACTERS, FILTER_CATEGORIES, ph } from '../data/mockContent'
import { useApp } from '../context/AppContext'

const SUBTABS = [
  { id: 's1', key: 'navigation.ask.subtab_ask.tab_name' },
  { id: 's2', key: 'companion_discover.tab_name_1' },
  { id: 's3', key: 'navigation.community.subtab_101.tab_name' },
]

export function FeedScreen() {
  const { openCharacterProfile, openFilter, baseLocale } = useApp()
  const [activeTab, setActiveTab] = useState('s1')
  const [tagsExpanded, setTagsExpanded] = useState(false)

  return (
    <div className="pb-6">
      {/* subtabs — real strings, not touched */}
      <div className="flex items-center gap-5 px-4 pt-1 border-b border-line">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2 text-[15px] font-semibold active:opacity-60 transition-opacity ${
              activeTab === t.id
                ? 'text-ink border-b-2 border-imely-primary'
                : 'text-muted'
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
          className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center shrink-0 self-start active:scale-90 transition-transform"
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
              className="shrink-0 bg-subtle rounded-full px-3 py-1.5 text-[13px] font-medium text-ink whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => setTagsExpanded((v) => !v)}
          className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center shrink-0 self-start active:scale-90 transition-transform"
        >
          {tagsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* section title */}
      <div className="px-4 mt-1 mb-2 font-extrabold text-[16px] text-ink flex items-center gap-1">
        ✨ <NoSheet>Gebetan Baru!</NoSheet>
      </div>

      {/* card grid — tappable, opens the character's profile page */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {MOCK_FEED_CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => openCharacterProfile(c.id)}
            className="rounded-2xl overflow-hidden border border-line bg-surface text-left active:scale-[0.97] transition-transform"
          >
            <div className="h-36 flex items-end p-2" style={{ backgroundColor: c.color }}>
              <div className="bg-black/40 text-white text-[11px] rounded-full px-2 py-0.5 flex items-center gap-1">
                <MessageCircle size={11} />
                {c.chatCount}
              </div>
            </div>
            <div className="p-2.5">
              <div className="font-bold text-[14px] text-ink">{ph(c.name, baseLocale)}</div>
              <div className="text-[12px] text-muted line-clamp-2 mt-0.5">{ph(c.tagline, baseLocale)}</div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {c.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-subtle text-muted rounded-full px-2 py-0.5">
                    {ph(tag, baseLocale)}
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
