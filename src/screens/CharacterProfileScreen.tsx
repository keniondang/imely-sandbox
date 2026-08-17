import { useState } from 'react'
import { ArrowLeft, Share2, MoreVertical, Sparkles, ChevronRight } from 'lucide-react'
import { Str } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { OpsiMenuSheet, BlockConfirmDialog, ReportReasonsSheet } from '../components/ProfileOptionsSheets'
import { useApp } from '../context/AppContext'
import { useProfileOptions } from '../hooks/useProfileOptions'
import { MOCK_FEED_CHARACTERS, ph, type MockCharacter } from '../data/mockContent'

export function CharacterProfileScreen() {
  const {
    activeCharacterId,
    closeCharacterProfile,
    openCharacterProfile,
    openCreatorProfile,
    openChat,
    showToast,
    baseLocale,
  } = useApp()
  const [readMore, setReadMore] = useState(false)

  const character = MOCK_FEED_CHARACTERS.find((c) => c.id === activeCharacterId)
  const characterName = character ? ph(character.name, baseLocale) : ''

  const opts = useProfileOptions('characterprofile', characterName, closeCharacterProfile)

  if (!character) return null

  const similar = MOCK_FEED_CHARACTERS.filter((c) => c.id !== character.id)

  function viewSimilar(c: MockCharacter) {
    setReadMore(false)
    openCharacterProfile(c.id)
  }

  function startChat() {
    openChat({ id: character.id, name: character.name, color: character.color })
    closeCharacterProfile()
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 bg-imely-ink text-white shrink-0">
        <button
          onClick={closeCharacterProfile}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 active:bg-white/10 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[15px] flex-1 px-2 truncate">{characterName}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => showToast('Bagikan — segera hadir')}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 active:bg-white/10 transition-transform"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => opts.setOptionsOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 active:bg-white/10 transition-transform"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-56" style={{ backgroundColor: character.color }} />

        <div className="px-4 pt-3">
          <div className="font-extrabold text-[22px] text-imely-ink">{characterName}</div>
          <div className="flex items-center gap-1 mt-1 text-[12px] text-gray-400">
            <Sparkles size={12} />
            <Str k="profile_bot.badge.ai_character" />
          </div>
          <div className="flex gap-6 mt-3">
            <Stat value={character.followers} labelKey="profile_creator.stat.followers" />
            <Stat value={character.chatCount} labelKey="profile_creator.stat.chats" />
          </div>
        </div>

        <div className="mx-4 mt-4 bg-imely-mint rounded-2xl p-4">
          <div className="text-[12px] font-semibold text-imely-primaryDark">
            <Str k="profile_bot.info.tagline" />
          </div>
          <div className="mt-1 text-[15.5px] font-bold italic text-imely-primaryDark leading-snug">
            "{ph(character.tagline, baseLocale)}"
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {character.tags.map((tag, i) => (
              <span key={i} className="bg-white rounded-full px-3 py-1 text-[12px] font-medium text-imely-ink">
                {ph(tag, baseLocale)}
              </span>
            ))}
          </div>
        </div>

        <Section labelKey="profile_bot.info.creator">
          <button
            onClick={() => openCreatorProfile(character.creatorId)}
            className="w-full flex items-center gap-2.5 active:opacity-70 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-[13.5px] text-imely-ink truncate">
                {ph(character.creatorName, baseLocale)}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-pink-500 bg-pink-50 rounded-full px-2 py-0.5 mt-0.5">
                🐣 <Str k={character.creatorBadgeKey} />
              </span>
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </button>
        </Section>

        <Section labelKey="profile_bot.info.creator_note">
          <div className="text-[13px] text-imely-ink leading-relaxed">{ph(character.creatorNote, baseLocale)}</div>
        </Section>

        <Section labelKey="profile_bot.info.public_info">
          <div className="text-[13.5px] text-imely-ink leading-relaxed">{ph(character.publicInfo, baseLocale)}</div>
        </Section>

        <Section labelKey="profile_bot.info.biography">
          <div className="text-[13.5px] text-imely-ink leading-relaxed">{ph(character.biography, baseLocale)}</div>
        </Section>

        <Section labelKey="profile_bot.info.first_message">
          <div className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: character.color }} />
            <div className="min-w-0">
              <div className={`text-[13px] text-imely-ink whitespace-pre-line ${readMore ? '' : 'line-clamp-3'}`}>
                {ph(character.firstMessage, baseLocale)}
              </div>
              <button
                onClick={() => setReadMore((v) => !v)}
                className="mt-1 text-imely-primaryDark font-semibold text-[12px] active:opacity-70 transition-opacity"
              >
                {readMore ? <NoSheet>Ciutkan</NoSheet> : <Str k="button.read_more" />}
              </button>
            </div>
          </div>
        </Section>

        <div className="mt-5 pb-5">
          <div className="px-4 font-extrabold text-[16px] text-imely-ink mb-2">
            <NoSheet>Karakter Serupa</NoSheet>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto">
            {similar.map((c) => (
              <button
                key={c.id}
                onClick={() => viewSimilar(c)}
                className="w-32 shrink-0 rounded-2xl overflow-hidden border border-imely-line text-left active:scale-[0.97] transition-transform"
              >
                <div className="h-28" style={{ backgroundColor: c.color }} />
                <div className="p-2">
                  <div className="font-bold text-[12.5px] text-imely-ink truncate">{ph(c.name, baseLocale)}</div>
                  <div className="text-[10.5px] text-gray-500 line-clamp-2 mt-0.5">{ph(c.tagline, baseLocale)}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{c.chatCount}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-imely-line">
        <button
          onClick={startChat}
          className="w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
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
        targetName={characterName}
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

function Stat({ value, labelKey }: { value: string; labelKey: string }) {
  return (
    <div>
      <div className="font-bold text-[15px] text-imely-ink">{value}</div>
      <div className="text-[11.5px] text-gray-400">
        <Str k={labelKey} />
      </div>
    </div>
  )
}

function Section({ labelKey, children }: { labelKey: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-4">
      <div className="text-[12px] font-semibold text-gray-400 mb-1.5">
        <Str k={labelKey} />
      </div>
      {children}
      <div className="mt-4 border-b border-imely-line" />
    </div>
  )
}
