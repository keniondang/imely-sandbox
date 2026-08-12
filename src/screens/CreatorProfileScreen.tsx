import { useState } from 'react'
import { ArrowLeft, Share2, MoreVertical, MessageCircle, FileText } from 'lucide-react'
import { Str } from '../components/Str'
import { OpsiMenuSheet, BlockConfirmDialog, ReportReasonsSheet } from '../components/ProfileOptionsSheets'
import { useApp } from '../context/AppContext'
import { useProfileOptions } from '../hooks/useProfileOptions'
import { MOCK_FEED_CHARACTERS } from '../data/mockContent'

export function CreatorProfileScreen() {
  const { activeCreatorName, closeCreatorProfile, closeCharacterProfile, openCharacterProfile, showToast } = useApp()
  const [tab, setTab] = useState<'characters' | 'info'>('characters')

  const characters = MOCK_FEED_CHARACTERS.filter((c) => c.creatorName === activeCreatorName)
  const rep = characters[0]

  const opts = useProfileOptions('creatorprofile', activeCreatorName ?? '', closeCharacterProfile)

  if (!activeCreatorName || !rep) return null

  function viewCharacter(id: string) {
    openCharacterProfile(id)
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeCreatorProfile}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => showToast('Bagikan — segera hadir')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => opts.setOptionsOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[17px] text-imely-ink truncate">{activeCreatorName}</div>
            <div className="flex gap-4 mt-1.5">
              <MiniStat value={rep.creatorFollowers} labelKey="profile_creator.stat.followers" />
              <MiniStat value={String(characters.length)} labelKey="profile_creator.stat.characters" />
              <MiniStat value={rep.chatCount} labelKey="profile_creator.stat.chats" />
            </div>
          </div>
        </div>

        <div className="px-4 mt-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-pink-500 bg-pink-50 rounded-full px-2.5 py-1">
            🐣 <Str k={rep.creatorBadgeKey} />
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
                className="rounded-2xl overflow-hidden border border-imely-line text-left active:scale-[0.97] transition-transform"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <FileText size={22} className="text-gray-300" />
            </div>
            <div className="text-[13px] text-gray-400">
              <Str k="profile_creator.about.empty" />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-imely-line flex gap-2">
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
        targetName={activeCreatorName}
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
    </div>
  )
}

function MiniStat({ value, labelKey }: { value: string; labelKey: string }) {
  return (
    <div>
      <div className="font-bold text-[14px] text-imely-ink">{value}</div>
      <div className="text-[11px] text-gray-400">
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
          : 'border-imely-line text-gray-400 bg-white'
      }`}
    >
      {children}
    </button>
  )
}
