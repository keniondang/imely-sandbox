import { useState } from 'react'
import { ArrowLeft, Share2, MoreVertical, MessageCircle, FileText, Camera } from 'lucide-react'
import { Str } from '../components/Str'
import { OpsiMenuSheet, BlockConfirmDialog, ReportReasonsSheet } from '../components/ProfileOptionsSheets'
import { useApp } from '../context/AppContext'
import { useProfileOptions } from '../hooks/useProfileOptions'
import { MOCK_FEED_CHARACTERS, MOCK_USER, ph } from '../data/mockContent'

// Reachable two ways: from a character's "Kreator" row (viewing SOMEONE
// ELSE'S creator profile, activeCreatorId = a real creatorId), or by tapping
// your own name on the Profile screen (activeCreatorId = the 'self'
// sentinel) — the latter shows all of MOCK_FEED_CHARACTERS as "your"
// characters and drops the follow/block/report actions, since those don't
// apply to your own profile.
const SELF_CREATOR_ID = 'self'

// Placeholder — follower count isn't tracked as real state anywhere in the
// sandbox (there's no "who follows you" list), so it's a fixed mock number
// rather than derived from data, same spirit as the other per-user stats
// throughout mockContent.ts.
const SELF_FOLLOWERS = '14'

function formatChatTotal(characters: { chatCount: string }[]): string {
  const total = characters.reduce((sum, c) => {
    const n = parseFloat(c.chatCount)
    const multiplier = c.chatCount.toUpperCase().includes('K') ? 1000 : 1
    return sum + n * multiplier
  }, 0)
  return total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total)
}

export function CreatorProfileScreen() {
  const {
    activeCreatorId,
    closeCreatorProfile,
    closeCharacterProfile,
    openCharacterProfile,
    openQrCode,
    openAvatarMenu,
    showToast,
    baseLocale,
  } = useApp()
  const [tab, setTab] = useState<'characters' | 'info'>('characters')
  const isSelf = activeCreatorId === SELF_CREATOR_ID

  const characters = isSelf
    ? MOCK_FEED_CHARACTERS
    : MOCK_FEED_CHARACTERS.filter((c) => c.creatorId === activeCreatorId)
  const rep = characters[0]
  const creatorName = isSelf ? ph(MOCK_USER.name, baseLocale) : rep ? ph(rep.creatorName, baseLocale) : ''

  const opts = useProfileOptions('creatorprofile', creatorName, closeCharacterProfile)

  if (!activeCreatorId || !rep) return null

  function viewCharacter(id: string) {
    openCharacterProfile(id)
  }

  return (
    <div className="h-full flex flex-col bg-surface relative">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeCreatorProfile}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={isSelf ? openQrCode : () => showToast('Bagikan — segera hadir')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
          >
            <Share2 size={16} />
          </button>
          {!isSelf && (
            <button
              onClick={() => opts.setOptionsOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
            >
              <MoreVertical size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 rounded-full bg-line bg-cover bg-center"
              style={isSelf ? { backgroundColor: MOCK_USER.avatarColor } : undefined}
            />
            {isSelf && (
              <button
                onClick={openAvatarMenu}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center active:scale-90 transition-transform"
              >
                <Camera size={10} className="text-ink" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[17px] text-ink truncate">{creatorName}</div>
            <div className="flex gap-4 mt-1.5">
              <MiniStat value={isSelf ? SELF_FOLLOWERS : rep.creatorFollowers} labelKey="profile_creator.stat.followers" />
              <MiniStat value={String(characters.length)} labelKey="profile_creator.stat.characters" />
              <MiniStat
                value={isSelf ? formatChatTotal(characters) : rep.chatCount}
                labelKey="profile_creator.stat.chats"
              />
            </div>
          </div>
        </div>

        <div className="px-4 mt-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-pink-500 bg-pink-50 rounded-full px-2.5 py-1">
            {isSelf ? '🥉' : '🐣'} <Str k={isSelf ? MOCK_USER.tierBadgeKey : rep.creatorBadgeKey} />
          </span>
        </div>

        <div className="flex justify-center gap-2 py-4">
          <TabButton active={tab === 'characters'} onClick={() => setTab('characters')}>
            <Str k="profile_creator.tab.characters" />
          </TabButton>
          <TabButton active={tab === 'info'} onClick={() => setTab('info')}>
            <Str k="profile_creator.tab.info" />
          </TabButton>
        </div>

        {tab === 'characters' ? (
          <div className="px-4 grid grid-cols-2 gap-3">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => viewCharacter(c.id)}
                className="rounded-2xl overflow-hidden border border-line text-left active:scale-[0.97] transition-transform"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-xl bg-subtle flex items-center justify-center mb-3">
              <FileText size={22} className="text-faint" />
            </div>
            <div className="text-[13px] text-muted">
              <Str k="profile_creator.about.empty" />
            </div>
          </div>
        )}
      </div>

      {!isSelf && (
        <div className="shrink-0 p-4 border-t border-line flex gap-2">
          <button
            onClick={opts.toggleFollow}
            className="flex-1 border border-imely-primary text-imely-primaryDark bg-imely-mint/30 font-bold rounded-full py-3 active:scale-[0.97] transition-transform"
          >
            <Str k={opts.following ? 'identity.follow.btn_followed' : 'identity.follow.btn_follow'} />
          </button>
          <button
            onClick={() => showToast('Pesan — segera hadir')}
            className="flex-1 bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
          >
            <Str k="toolbar_menu.chat" />
          </button>
        </div>
      )}

      {!isSelf && (
        <>
          <OpsiMenuSheet
            optionsOpen={opts.optionsOpen}
            onClose={() => opts.setOptionsOpen(false)}
            following={opts.following}
            onToggleFollow={opts.toggleFollow}
            onOpenBlockConfirm={opts.openBlockConfirm}
            onOpenReport={opts.openReport}
            onModerate={() => showToast('Moderasi — khusus internal')}
          />
          <BlockConfirmDialog
            targetName={creatorName}
            open={opts.blockConfirmOpen}
            onClose={() => opts.setBlockConfirmOpen(false)}
            onConfirm={opts.confirmBlock}
          />
          <ReportReasonsSheet
            open={opts.reportOpen}
            onClose={() => opts.setReportOpen(false)}
            reason={opts.reportReason}
            onSelectReason={opts.setReportReason}
            onSend={opts.sendReport}
          />
        </>
      )}
    </div>
  )
}

function MiniStat({ value, labelKey }: { value: string; labelKey: string }) {
  return (
    <div>
      <div className="font-bold text-[14px] text-ink">{value}</div>
      <div className="text-[11px] text-muted">
        <Str k={labelKey} />
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-6 py-1.5 text-[13px] font-semibold border active:scale-95 transition-transform ${
        active
          ? 'border-imely-primary text-imely-primaryDark bg-imely-mint/40'
          : 'border-line text-muted bg-surface'
      }`}
    >
      {children}
    </button>
  )
}
