import { useState } from 'react'
import { ArrowLeft, User, Phone, Share2, Play, UserCog, Trash2, Ban, Flag, MessageCircle } from 'lucide-react'
import { Str } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { BlockConfirmDialog, ReportReasonsSheet } from '../components/ProfileOptionsSheets'
import { useApp } from '../context/AppContext'
import { useProfileOptions } from '../hooks/useProfileOptions'
import { MOCK_FEED_CHARACTERS, ph } from '../data/mockContent'

export function ChatOptionsScreen() {
  const { activeChat, closeChat, closeChatOptions, openCharacterProfile, requestPopup, showToast, baseLocale } =
    useApp()
  const [autoPlayVoice, setAutoPlayVoice] = useState(false)

  const activeChatName = activeChat ? ph(activeChat.name, baseLocale) : ''
  const opts = useProfileOptions('chatoptions', activeChatName, closeChat)

  if (!activeChat) return null

  const character = MOCK_FEED_CHARACTERS.find((c) => c.id === activeChat.id)
  const similar = MOCK_FEED_CHARACTERS.filter((c) => c.id !== activeChat.id)

  function viewProfile() {
    if (character) openCharacterProfile(character.id)
    else showToast('Lihat profil — segera hadir')
  }

  function openPersonalize() {
    closeChatOptions()
    requestPopup('chatdetail', 'role_summary')
  }

  return (
    <div className="h-full flex flex-col bg-surface relative">
      <div className="relative flex items-center px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeChatOptions}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 font-bold text-[16px] text-ink">
          <Str k="chat.menu.title" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="flex flex-col items-center pt-5 pb-4">
          <div className="w-16 h-16 rounded-full" style={{ backgroundColor: activeChat.color }} />
          <div className="mt-2 font-bold text-[16px] text-ink">{activeChatName}</div>
        </div>

        <div className="px-4 grid grid-cols-3 gap-2">
          <IconAction icon={<User size={18} />} labelKey="chat.menu.view_profile" onClick={viewProfile} />
          <IconAction icon={<Phone size={18} />} label="Call" onClick={() => showToast('Call — segera hadir')} />
          <IconAction
            icon={<Share2 size={18} />}
            labelKey="menu.common.share"
            onClick={() => showToast('Bagikan — segera hadir')}
          />
        </div>

        <div className="mt-4">
          <div className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line">
            <Play size={17} className="text-ink shrink-0" />
            <span className="flex-1 text-[14px] text-ink">
              <Str k="chat.menu.auto_play_tts" />
            </span>
            <button
              onClick={() => setAutoPlayVoice((v) => !v)}
              aria-label="Toggle auto-play voice"
              aria-pressed={autoPlayVoice}
              className={`w-10 h-6 rounded-full shrink-0 transition-colors relative ${
                autoPlayVoice ? 'bg-imely-primary' : 'bg-line'
              }`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-surface transition-[left]"
                style={{ left: autoPlayVoice ? '18px' : '2px' }}
              />
            </button>
          </div>

          <button
            onClick={openPersonalize}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <UserCog size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="chat.personalize_menu.title" />
            </span>
          </button>

          <button
            onClick={() => showToast('Hapus percakapan — segera hadir')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <Trash2 size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="chat.menu.delete_conversation" />
            </span>
          </button>

          <button
            onClick={opts.openBlockConfirm}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <Ban size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="chat.menu.block_user" />
            </span>
          </button>

          <button
            onClick={() => showToast('Fitur QA internal — segera hadir')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
          >
            <Flag size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <NoSheet>[Test] Top-up Gem</NoSheet>
            </span>
          </button>

          <button
            onClick={opts.openReport}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-subtle transition-colors text-left"
          >
            <Flag size={17} className="text-ink" />
            <span className="text-[14px] text-ink">
              <Str k="chat.menu.report" />
            </span>
          </button>
        </div>

        <div className="mt-5">
          <div className="px-4 font-extrabold text-[16px] text-ink mb-2">
            <NoSheet>Karakter Serupa</NoSheet>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto">
            {similar.map((c) => (
              <button
                key={c.id}
                onClick={() => openCharacterProfile(c.id)}
                className="w-32 shrink-0 rounded-2xl overflow-hidden border border-line text-left active:scale-[0.97] transition-transform"
              >
                <div className="h-28 flex items-end p-1.5" style={{ backgroundColor: c.color }}>
                  <div className="bg-black/40 text-white text-[10px] rounded-full px-1.5 py-0.5 flex items-center gap-1">
                    <MessageCircle size={9} />
                    {c.chatCount}
                  </div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-[12.5px] text-ink truncate">{ph(c.name, baseLocale)}</div>
                  <div className="text-[10.5px] text-muted line-clamp-2 mt-0.5">{ph(c.tagline, baseLocale)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BlockConfirmDialog
        targetName={activeChatName}
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

function IconAction({
  icon,
  labelKey,
  label,
  onClick,
}: {
  icon: React.ReactNode
  labelKey?: string
  label?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 bg-subtle rounded-xl py-3 active:bg-line transition-colors"
    >
      <span className="text-ink">{icon}</span>
      <span className="text-[11.5px] text-ink text-center leading-tight">
        {labelKey ? <Str k={labelKey} /> : <NoSheet>{label}</NoSheet>}
      </span>
    </button>
  )
}
