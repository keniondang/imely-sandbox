import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { resolveString } from '../lib/strings'

interface BadgeItem {
  titleKey: string
  previewKey: string
  detailKey: string
  earned: boolean
  emoji: string
  bg: string
}

const SULTAN: BadgeItem[] = [
  { titleKey: 'badge.patron_baby_shark', previewKey: 'badge.patron_baby_shark.preview', detailKey: 'badge.patron_baby_shark.body_earned', earned: true, emoji: '🦈', bg: '#DCF3E4' },
  { titleKey: 'badge.patron_shark', previewKey: 'badge.patron_shark.preview', detailKey: 'badge.patron_shark.body_earned', earned: true, emoji: '🦈', bg: '#FBDCE9' },
  { titleKey: 'badge.patron_whale', previewKey: 'badge.patron_whale.preview', detailKey: 'badge.patron_whale.body_earned', earned: true, emoji: '🐳', bg: '#E7DDF9' },
]

const RANKING: BadgeItem[] = [
  { titleKey: 'badge.creator_top1', previewKey: 'badge.creator_top1.preview', detailKey: 'badge.creator_top1.body_not_earned', earned: true, emoji: '🥇', bg: '#FCE9A8' },
  { titleKey: 'badge.creator_top2', previewKey: 'badge.creator_top2.preview', detailKey: 'badge.creator_top2.body_not_earned', earned: false, emoji: '🥈', bg: '#E5E7EB' },
  { titleKey: 'badge.creator_top3', previewKey: 'badge.creator_top3.preview', detailKey: 'badge.creator_top3.body_not_earned', earned: false, emoji: '🥉', bg: '#F3D9BC' },
]

const CREATOR: BadgeItem[] = [
  { titleKey: 'badge.creator_rookie', previewKey: 'badge.creator_rookie.preview', detailKey: 'badge.creator_rookie.body_earned', earned: true, emoji: '🌱', bg: '#FBB4B4' },
  { titleKey: 'badge.creator_exclusive', previewKey: 'badge.creator_exclusive.preview', detailKey: 'badge.creator_exclusive.body_earned', earned: false, emoji: '✨', bg: '#A6ECE0' },
]

export function BadgesScreen() {
  const { closeBadges, locale, showToast } = useApp()

  function tapBadge(b: BadgeItem) {
    showToast(resolveString(b.detailKey, locale))
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeBadges}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="badge.screen.title" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <BadgeSection labelKey="badge.section.patron" items={SULTAN} onTap={tapBadge} />
        <BadgeSection labelKey="badge.section.status" items={RANKING} onTap={tapBadge} />
        <BadgeSection labelKey="badge.section.creator_identity" items={CREATOR} onTap={tapBadge} />
      </div>
    </div>
  )
}

function BadgeSection({ labelKey, items, onTap }: { labelKey: string; items: BadgeItem[]; onTap: (b: BadgeItem) => void }) {
  return (
    <div className="mb-6">
      <div className="font-bold text-[16px] text-imely-ink mb-3">
        <Str k={labelKey} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((b) => (
          <button
            key={b.titleKey}
            onClick={() => onTap(b)}
            className={`flex flex-col items-center text-center active:scale-95 transition-transform ${
              b.earned ? '' : 'opacity-40 grayscale'
            }`}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: b.bg }}
            >
              {b.emoji}
            </div>
            <div className="mt-2 font-semibold text-[13px] text-imely-ink">
              <Str k={b.titleKey} />
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              <Str k={b.previewKey} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
