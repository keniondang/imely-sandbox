import { useState } from 'react'
import { ArrowLeft, Share2, MoreVertical, Sparkles, ChevronRight, Lock, UserPlus, UserMinus, Ban, Flag } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { ZoneScope } from '../context/ScreenScope'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { resolveString } from '../lib/strings'
import { MOCK_FEED_CHARACTERS, type MockCharacter } from '../data/mockContent'

const REPORT_REASONS = [
  'report_news.obscene_content',
  'report_news.illegal_content',
  'report_news.bad_rumors_content',
  'report_news.report_issue',
]

export function CharacterProfileScreen() {
  const { locale, activeCharacterId, closeCharacterProfile, openCharacterProfile, openCreatorProfile, openChat, showToast } =
    useApp()
  const [readMore, setReadMore] = useState(false)
  const [following, setFollowing] = useState(false)

  const [optionsOpen, setOptionsOpen] = useState(false)
  usePopupRequest('characterprofile', 'menu', setOptionsOpen)

  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  usePopupRequest('characterprofile', 'block_confirm', setBlockConfirmOpen)

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  usePopupRequest('characterprofile', 'report', setReportOpen)

  const character = MOCK_FEED_CHARACTERS.find((c) => c.id === activeCharacterId)
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

  function toggleFollow() {
    setOptionsOpen(false)
    setFollowing((f) => !f)
    showToast(
      following
        ? resolveString('identity.follow.un_follow_success_toast', locale)
        : `${resolveString('identity.follow.follow_success_toast', locale)} ${character.name}`
    )
  }

  function openBlockConfirm() {
    setOptionsOpen(false)
    setBlockConfirmOpen(true)
  }

  function confirmBlock() {
    setBlockConfirmOpen(false)
    showToast(`${character.name} diblokir`)
    closeCharacterProfile()
  }

  function openReport() {
    setOptionsOpen(false)
    setReportOpen(true)
  }

  function sendReport() {
    setReportOpen(false)
    setReportReason(null)
    showToast(resolveString('report_news.report_success_toast', locale))
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
        <div className="font-bold text-[15px] flex-1 px-2 truncate">{character.name}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => showToast('Bagikan — segera hadir')}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 active:bg-white/10 transition-transform"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setOptionsOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 active:bg-white/10 transition-transform"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-56" style={{ backgroundColor: character.color }} />

        <div className="px-4 pt-3">
          <div className="font-extrabold text-[22px] text-imely-ink">{character.name}</div>
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
            "{character.tagline}"
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {character.tags.map((tag) => (
              <span key={tag} className="bg-white rounded-full px-3 py-1 text-[12px] font-medium text-imely-ink">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Section labelKey="profile_bot.info.creator">
          <button
            onClick={() => openCreatorProfile(character.creatorName)}
            className="w-full flex items-center gap-2.5 active:opacity-70 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-[13.5px] text-imely-ink truncate">{character.creatorName}</div>
              <span className="inline-flex items-center gap-1 text-[11px] text-pink-500 bg-pink-50 rounded-full px-2 py-0.5 mt-0.5">
                🐣 <Str k={character.creatorBadgeKey} />
              </span>
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </button>
        </Section>

        <Section labelKey="profile_bot.info.creator_note">
          <div className="text-[13px] text-imely-ink leading-relaxed">{character.creatorNote}</div>
        </Section>

        <Section labelKey="profile_bot.info.public_info">
          <div className="text-[13.5px] text-imely-ink leading-relaxed">{character.publicInfo}</div>
        </Section>

        <Section labelKey="profile_bot.info.biography">
          <div className="text-[13.5px] text-imely-ink leading-relaxed">{character.biography}</div>
        </Section>

        <Section labelKey="profile_bot.info.first_message">
          <div className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: character.color }} />
            <div className="min-w-0">
              <div className={`text-[13px] text-imely-ink whitespace-pre-line ${readMore ? '' : 'line-clamp-3'}`}>
                {character.firstMessage}
              </div>
              <button
                onClick={() => setReadMore((v) => !v)}
                className="mt-1 text-imely-primaryDark font-semibold text-[12px] active:opacity-70 transition-opacity"
              >
                {readMore ? 'Ciutkan' : <Str k="button.read_more" />}
              </button>
            </div>
          </div>
        </Section>

        <div className="mt-5 pb-5">
          <div className="px-4 font-extrabold text-[16px] text-imely-ink mb-2">Karakter Serupa</div>
          <div className="flex gap-3 px-4 overflow-x-auto">
            {similar.map((c) => (
              <button
                key={c.id}
                onClick={() => viewSimilar(c)}
                className="w-32 shrink-0 rounded-2xl overflow-hidden border border-imely-line text-left active:scale-[0.97] transition-transform"
              >
                <div className="h-28" style={{ backgroundColor: c.color }} />
                <div className="p-2">
                  <div className="font-bold text-[12.5px] text-imely-ink truncate">{c.name}</div>
                  <div className="text-[10.5px] text-gray-500 line-clamp-2 mt-0.5">{c.tagline}</div>
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

      {/* Opsi bottom sheet — opened from the header's three-dot button */}
      {optionsOpen && (
        <ZoneScope zone="menu">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setOptionsOpen(false)}
              aria-label="Close options"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
              <div className="text-center py-4 border-b border-imely-line font-bold text-[16px] text-imely-ink">
                <Str k="toolbar_menu.header" />
              </div>
              <button
                onClick={() => showToast('Moderasi — khusus internal')}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <Lock size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="profile_menu.censor_content" />
                </span>
              </button>
              <button
                onClick={toggleFollow}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                {following ? <UserMinus size={17} className="text-imely-ink" /> : <UserPlus size={17} className="text-imely-ink" />}
                <span className="text-[14px] text-imely-ink">
                  <Str k={following ? 'toolbar_menu.unfollow' : 'toolbar_menu.follow'} />
                </span>
              </button>
              <button
                onClick={openBlockConfirm}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <Ban size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="toolbar_menu.block" />
                </span>
              </button>
              <button
                onClick={openReport}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
              >
                <Flag size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="toolbar_menu.report" />
                </span>
              </button>
              <div className="h-2" />
            </div>
          </div>
        </ZoneScope>
      )}

      {/* block confirmation — opened from the Opsi sheet's "Blokir" row */}
      {blockConfirmOpen && (
        <ZoneScope zone="block_confirm">
          <div className="absolute inset-0 z-20">
            <button
              onClick={() => setBlockConfirmOpen(false)}
              aria-label="Close block confirmation"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5">
              <div className="font-bold text-[17px] text-imely-ink">
                <Str k="profile_menu.block_dialog_title" /> {character.name}?
              </div>
              <div className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                <Str k="profile_menu.block_dialog_msg" /> {character.name}.
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setBlockConfirmOpen(false)}
                  className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity"
                >
                  <Str k="profile_menu.block_dialog_btn_cancel" />
                </button>
                <button
                  onClick={confirmBlock}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="profile_menu.block_dialog_btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* report reasons — opened from the Opsi sheet's "Laporkan" row */}
      {reportOpen && (
        <ZoneScope zone="report">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setReportOpen(false)}
              aria-label="Close report"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
              <div className="text-center py-4 border-b border-imely-line font-bold text-[16px] text-imely-ink">
                <Str k="report_news.header" />
              </div>
              {REPORT_REASONS.map((key) => (
                <button
                  key={key}
                  onClick={() => setReportReason(key)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                      reportReason === key ? 'border-imely-primary' : 'border-gray-300'
                    }`}
                  >
                    {reportReason === key && <span className="w-2.5 h-2.5 rounded-full bg-imely-primary" />}
                  </span>
                  <span className="text-[14px] text-imely-ink">
                    <Str k={key} />
                  </span>
                </button>
              ))}
              <div className="flex gap-2 p-4">
                <button
                  onClick={() => setReportOpen(false)}
                  className="flex-1 border border-imely-line rounded-full py-2.5 font-semibold text-[13.5px] text-imely-ink active:scale-95 transition-transform"
                >
                  <Str k="report_news.btn_cancel" />
                </button>
                <button
                  onClick={sendReport}
                  disabled={!reportReason}
                  className="flex-1 bg-imely-primary text-white rounded-full py-2.5 font-semibold text-[13.5px] active:scale-95 active:bg-imely-primaryDark transition-transform disabled:opacity-40"
                >
                  <Str k="report_news.btn_send" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
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
