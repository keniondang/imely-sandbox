import { useState } from 'react'
import { ArrowLeft, MoreVertical, Send, Info, ChevronDown, ChevronRight, Play, Mic, Plus, Gem, Hand, X, Pencil } from 'lucide-react'
import { Str, useRegisterKeys } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { useApp } from '../context/AppContext'
import { ZoneScope } from '../context/ScreenScope'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { resolveString } from '../lib/strings'
import { MOCK_FEED_CHARACTERS, MOCK_USER, ph, type LocalizedText } from '../data/mockContent'

const FIRST_MESSAGE_FALLBACK: LocalizedText = {
  id: '[Pesan pembuka placeholder]',
  en: '[Placeholder opening message]',
  vi: '[Tin nhắn mở đầu giữ chỗ]',
}

// Score bands are game-economy config, not xlsx content — level names/labels are real.
const RELATIONSHIP_LEVELS = [
  { key: 'relationship.level.enemy', emoji: '🔥', min: -Infinity, max: -101, rangeLabel: '∞ → -101' },
  { key: 'relationship.level.distant', emoji: '💫', min: -100, max: -1, rangeLabel: '-100 → -1' },
  { key: 'relationship.level.new', emoji: '👋', min: 0, max: 100, rangeLabel: '0 → 100' },
  { key: 'relationship.level.close', emoji: '🌟', min: 101, max: 200, rangeLabel: '101 → 200' },
  { key: 'relationship.level.ambiguous', emoji: '💜', min: 201, max: 300, rangeLabel: '201 → 300' },
  { key: 'relationship.level.crush', emoji: '💝', min: 301, max: 400, rangeLabel: '301 → 400' },
  { key: 'relationship.level.destined', emoji: '💖', min: 401, max: Infinity, rangeLabel: '401+' },
]

interface Bubble {
  id: string
  from: 'me' | 'bot'
  text: string
}

const CANNED_REPLIES = [
  '[Balasan placeholder 1]',
  '[Placeholder reply 2]',
  '[Trả lời giữ chỗ 3]',
]

// Real chat-mode catalog from the xlsx — no dedicated "pick a mode" sheet
// title exists there, so that one heading is placeholder.
const CHAT_MODES = [
  { id: 'lite', titleKey: 'chat.mode.lite.title', descKey: 'chat.mode.lite.description' },
  { id: 'flash', titleKey: 'chat.mode.flash.title', descKey: 'chat.mode.flash.description' },
  { id: 'pro', titleKey: 'chat.mode.pro.title', descKey: 'chat.mode.pro.description' },
]

export function ChatDetailScreen() {
  const { activeChat, closeChat, openChatOptions, openGems, baseLocale, showToast } = useApp()
  useRegisterKeys([
    'chat.mode.changed.toast',
    'role.edit.success',
    'chat.input_box_hint',
    'role.edit.name.hint',
    'role.edit.description.hint',
  ])
  const character = activeChat ? MOCK_FEED_CHARACTERS.find((c) => c.id === activeChat.id) : undefined

  const [input, setInput] = useState('')
  const [bubbles, setBubbles] = useState<Bubble[]>(() => [
    { id: 'b0', from: 'bot', text: ph(character?.firstMessage ?? FIRST_MESSAGE_FALLBACK, baseLocale) },
  ])
  const [typing, setTyping] = useState(false)
  const [expandedInfo, setExpandedInfo] = useState<Set<string>>(new Set())

  const [chatMode, setChatMode] = useState(CHAT_MODES[1])
  const [modePickerOpen, setModePickerOpen] = useState(false)
  usePopupRequest('chatdetail', 'mode_picker', setModePickerOpen)

  const [relationshipOpen, setRelationshipOpen] = useState(false)
  usePopupRequest('chatdetail', 'relationship', setRelationshipOpen)

  const [voiceBarOpen, setVoiceBarOpen] = useState(false)
  const [listening, setListening] = useState(false)

  const [personaName, setPersonaName] = useState(ph(MOCK_USER.name, baseLocale))
  const [personaDescription, setPersonaDescription] = useState('')
  const [personaDraftName, setPersonaDraftName] = useState(personaName)
  const [personaDraftDescription, setPersonaDraftDescription] = useState(personaDescription)

  const [roleSummaryOpen, setRoleSummaryOpen] = useState(false)
  usePopupRequest('chatdetail', 'role_summary', setRoleSummaryOpen)

  const [roleEditOpen, setRoleEditOpen] = useState(false)
  usePopupRequest('chatdetail', 'role_edit', setRoleEditOpen)

  if (!activeChat) return null

  const sentCount = bubbles.filter((b) => b.from === 'me').length
  const activeLevel =
    RELATIONSHIP_LEVELS.find((l) => sentCount >= l.min && sentCount <= l.max) ??
    RELATIONSHIP_LEVELS[2]
  const scoreDenominator = Number.isFinite(activeLevel.max) ? activeLevel.max : sentCount || 1

  function toggleInfoRow(id: string) {
    setExpandedInfo((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

  function selectMode(mode: (typeof CHAT_MODES)[number]) {
    setChatMode(mode)
    setModePickerOpen(false)
    showToast(resolveString('chat.mode.changed.toast', baseLocale, { chatModeTitle: resolveString(mode.titleKey, baseLocale) }))
  }

  function releaseVoice() {
    if (listening) showToast('Pesan suara terkirim')
    setListening(false)
    setVoiceBarOpen(false)
  }

  function openRoleEdit() {
    setPersonaDraftName(personaName)
    setPersonaDraftDescription(personaDescription)
    setRoleSummaryOpen(false)
    setRoleEditOpen(true)
  }

  function saveRoleEdit() {
    setPersonaName(personaDraftName.trim() || personaName)
    setPersonaDescription(personaDraftDescription)
    setRoleEditOpen(false)
    showToast(resolveString('role.edit.success', baseLocale))
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeChat}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: activeChat.color }} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[14.5px] text-imely-ink truncate">{ph(activeChat.name, baseLocale)}</div>
          <div className="text-[11px] text-imely-primary">
            <NoSheet>Online</NoSheet>
          </div>
        </div>
        <button
          onClick={openGems}
          className="flex items-center gap-1 bg-imely-mint rounded-full px-2.5 py-1 text-[12px] font-semibold text-imely-primaryDark shrink-0 active:scale-95 transition-transform"
        >
          <Gem size={12} className="text-sky-400" />
          {MOCK_USER.gems.toLocaleString('id-ID')}
        </button>
        <button
          onClick={() => setRelationshipOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <Hand size={16} />
        </button>
        <button
          onClick={openChatOptions}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto flex flex-col bg-cover bg-center"
        style={character ? { backgroundColor: character.color } : undefined}
      >
        {character ? (
          <div className="px-2 pt-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-black/50 text-white text-[10.5px] rounded-full px-2.5 py-1.5">
              <Info size={12} className="shrink-0" />
              <span className="truncate">
                <Str k="chat.bot_disclaimer_banner.title" />
              </span>
            </div>

            <div className="mt-2 rounded-2xl bg-black/45 px-3 pt-2 pb-1">
              <InfoRow
                labelKey="profile_bot.info.tagline"
                value={`"${ph(character.tagline, baseLocale)}"`}
                expanded={expandedInfo.has('tagline')}
                onToggle={() => toggleInfoRow('tagline')}
              />
              <InfoRow
                labelKey="profile_bot.info.public_info"
                value={ph(character.publicInfo, baseLocale)}
                expanded={expandedInfo.has('public_info')}
                onToggle={() => toggleInfoRow('public_info')}
              />
              <InfoRow
                labelKey="profile_bot.info.biography"
                value={ph(character.biography, baseLocale)}
                expanded={expandedInfo.has('biography')}
                onToggle={() => toggleInfoRow('biography')}
              />
              <InfoRow
                labelKey="chat.bot_info.role.title"
                value={personaName}
                expanded={false}
                onToggle={() => setRoleSummaryOpen(true)}
                navigates
                last
              />
            </div>
          </div>
        ) : (
          <div className="mx-3 mt-2 rounded-xl bg-gray-50 px-3 py-2 shrink-0">
            <div className="text-[11px] font-semibold text-imely-ink">
              <Str k="chat.bot_disclaimer_banner.title" />
            </div>
            <div className="text-[10.5px] text-gray-400 mt-0.5">
              <Str k="chat.bot_disclaimer_banner.subtitle" />
            </div>
          </div>
        )}

        <div className="flex-1 px-3 py-3 space-y-2.5">
          <div className="flex justify-center">
            <span
              className={`text-[11px] rounded-full px-3 py-1 capitalize ${
                character ? 'text-white bg-black/30' : 'text-gray-400 bg-gray-100'
              }`}
            >
              <Str k="user_gem_overview.txt_today" />
            </span>
          </div>

          {bubbles.map((b) => (
            <div key={b.id} className={`flex ${b.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              {b.from === 'me' ? (
                <div className="max-w-[75%] rounded-2xl px-3 py-2 text-[13.5px] bg-imely-primary text-white rounded-br-sm">
                  {b.text}
                </div>
              ) : (
                <div className="max-w-[80%] flex items-start gap-1.5">
                  <button
                    onClick={() => showToast('Putar suara — segera hadir')}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 active:scale-90 transition-transform ${
                      character ? 'bg-black/30' : 'bg-gray-100'
                    }`}
                  >
                    <Play size={10} className={character ? 'text-white' : 'text-imely-ink'} />
                  </button>
                  <div
                    className={`rounded-2xl rounded-bl-sm px-3 py-2 text-[13.5px] space-y-0.5 ${
                      character ? 'bg-black/40 text-white' : 'bg-gray-100 text-imely-ink'
                    }`}
                  >
                    {b.text.split('\n').map((line, i) => {
                      const isAction = line.startsWith('*') && line.endsWith('*')
                      return (
                        <div key={i} className={isAction ? `italic ${character ? 'text-white/70' : 'text-gray-500'}` : ''}>
                          {isAction ? line.slice(1, -1) : line}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div
                className={`rounded-2xl rounded-bl-sm px-3 py-2 text-[13.5px] ${
                  character ? 'bg-black/40 text-white/70' : 'bg-gray-100 text-gray-400'
                }`}
              >
                ...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* mode / quick-action chips */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-imely-line shrink-0">
        <button
          onClick={() => setModePickerOpen(true)}
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-imely-ink active:scale-95 transition-transform"
        >
          💬 <Str k={chatMode.titleKey} />
        </button>
        <button
          onClick={() => showToast('Tindakan — segera hadir')}
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-imely-ink active:scale-95 transition-transform"
        >
          ✳ <Str k="chat.quick_action.default" />
        </button>
      </div>

      {/* input bar — real placeholder string */}
      {voiceBarOpen ? (
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-imely-line shrink-0">
          <button
            onClick={() => {
              setListening(false)
              setVoiceBarOpen(false)
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
          >
            <X size={18} />
          </button>
          <button
            onPointerDown={() => setListening(true)}
            onPointerUp={releaseVoice}
            onPointerLeave={() => setListening(false)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-bold select-none transition-colors ${
              listening ? 'bg-red-50 text-red-500' : 'bg-imely-mint text-imely-primaryDark'
            }`}
          >
            <Mic size={16} />
            {listening ? (
              <>
                <Str k="chat.speech_to_text.listening" /> · <Str k="chat.speech_to_text.release_to_send_button" />
              </>
            ) : (
              <Str k="chat.speech_to_text.push_to_talk_button" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-imely-line shrink-0">
          <button
            onClick={() => showToast('Lampiran — segera hadir')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
          >
            <Plus size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={resolveString('chat.input_box_hint', baseLocale)}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13.5px] outline-none"
          />
          {input.trim() ? (
            <button
              onClick={send}
              className="w-10 h-10 rounded-full bg-imely-primary text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
            >
              <Send size={16} />
            </button>
          ) : (
            <button
              onClick={() => setVoiceBarOpen(true)}
              className="w-10 h-10 rounded-full bg-imely-primary text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
            >
              <Mic size={16} />
            </button>
          )}
        </div>
      )}

      {/* chat mode picker — opened from the "Intens" chip */}
      {modePickerOpen && (
        <ZoneScope zone="mode_picker">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setModePickerOpen(false)}
              aria-label="Close mode picker"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4">
              <div className="text-center font-bold text-[16px] text-imely-ink mb-3">
                <NoSheet>Mode Obrolan</NoSheet>
              </div>
              {CHAT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className={`w-full text-left rounded-2xl border p-3 mb-2 transition-colors ${
                    chatMode.id === mode.id ? 'border-imely-primary bg-imely-mint/30' : 'border-imely-line'
                  }`}
                >
                  <div className="font-bold text-[14px] text-imely-ink">
                    <Str k={mode.titleKey} />
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    <Str k={mode.descKey} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ZoneScope>
      )}

      {/* relationship level — opened from the wave/hand button in the header */}
      {relationshipOpen && (
        <ZoneScope zone="relationship">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setRelationshipOpen(false)}
              aria-label="Close relationship level"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 max-h-[85%] bg-white rounded-3xl overflow-y-auto">
              <div className="flex items-center justify-center px-4 py-4 border-b border-imely-line">
                <div className="font-bold text-[17px] text-imely-ink">
                  <Str k="relationship.level.label" />
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                  <div className="flex flex-col items-center gap-1 w-16">
                    <div className="w-11 h-11 rounded-full bg-gray-200" />
                    <span className="text-[11px] text-imely-ink">
                      <Str k="relationship.detail.you" />
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[22px]">{activeLevel.emoji}</span>
                    <span className="text-[13px] font-bold text-imely-primaryDark">
                      <Str k={activeLevel.key} />
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-16">
                    <div className="w-11 h-11 rounded-full" style={{ backgroundColor: activeChat.color }} />
                    <span className="text-[11px] text-imely-ink truncate w-full text-center">
                      {ph(activeChat.name, baseLocale)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[13px]">
                  <span className="text-imely-ink font-semibold">
                    <Str k="relationship.detail.your_score" />:
                  </span>
                  <span className="text-imely-ink font-bold">
                    {sentCount}/{scoreDenominator}
                  </span>
                </div>

                <div className="mt-2 text-[12px] text-gray-500 space-y-1">
                  <div>
                    • <Str k="relationship.detail.acquainted_days" />{' '}
                    <span className="font-semibold text-imely-ink">
                      <Str k="relationship.detail.acquainted_days_value" vars={{ aDays: 0 }} />
                    </span>
                  </div>
                  <div>
                    • <Str k="relationship.detail.sent_messages" />{' '}
                    <span className="font-semibold text-imely-ink">
                      <Str k="relationship.detail.sent_messages_value" vars={{ smCount: sentCount }} />
                    </span>
                  </div>
                </div>

                <div className="mt-4 font-bold text-[13px] text-imely-ink">
                  <Str k="relationship.detail.levels" />:
                </div>
                <div className="mt-2 space-y-1.5">
                  {RELATIONSHIP_LEVELS.map((lvl) => (
                    <div
                      key={lvl.key}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                        lvl.key === activeLevel.key
                          ? 'bg-imely-mint text-imely-primaryDark font-bold'
                          : 'bg-gray-50 text-imely-ink'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[13px]">
                        {lvl.emoji} <Str k={lvl.key} />
                      </span>
                      <span className="text-[12px] text-gray-400">{lvl.rangeLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* "Ganti peran" — opened from the "Persona kamu" row, or the Opsi page's Personalisasi row */}
      {roleSummaryOpen && (
        <ZoneScope zone="role_summary">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setRoleSummaryOpen(false)}
              aria-label="Close role summary"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="role.summary.title" />
                </div>
                <button
                  onClick={() => setRoleSummaryOpen(false)}
                  className="text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>
              <button
                onClick={openRoleEdit}
                className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
              >
                <span className="text-[14px] text-imely-ink">{personaName}</span>
                <Pencil size={15} className="text-gray-400 shrink-0" />
              </button>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Edit persona — opened from the pencil icon on "Ganti peran" */}
      {roleEditOpen && (
        <ZoneScope zone="role_edit">
          <div className="absolute inset-0 z-20">
            <button
              onClick={() => setRoleEditOpen(false)}
              aria-label="Close edit role"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="button.edit" />
                </div>
                <button
                  onClick={() => setRoleEditOpen(false)}
                  className="text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 py-3">
                <div className="text-[12.5px] font-semibold text-imely-ink mb-1.5">
                  <Str k="role.edit.name.label" />
                </div>
                <input
                  value={personaDraftName}
                  onChange={(e) => setPersonaDraftName(e.target.value)}
                  placeholder={resolveString('role.edit.name.hint', baseLocale)}
                  className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-[13.5px] outline-none"
                />
                <div className="text-[11px] text-gray-400 mt-1">
                  20 <Str k="role.edit.character_limit" />
                </div>

                <div className="text-[12.5px] font-semibold text-imely-ink mt-4 mb-1.5">
                  <Str k="role.edit.description.label" />
                </div>
                <textarea
                  value={personaDraftDescription}
                  onChange={(e) => setPersonaDraftDescription(e.target.value)}
                  placeholder={resolveString('role.edit.description.hint', baseLocale)}
                  rows={3}
                  className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-[13.5px] outline-none resize-none"
                />
                <div className="text-[11px] text-gray-400 mt-1">
                  1000 <Str k="role.edit.character_limit" />
                </div>

                <div className="text-[11px] text-red-500 mt-3">
                  <Str k="role.edit.refresh_notice" />
                </div>

                <button
                  onClick={saveRoleEdit}
                  className="mt-4 w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
                >
                  <Str k="input_invite_code.btn_done" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}

function InfoRow({
  labelKey,
  value,
  expanded,
  onToggle,
  last,
  navigates,
}: {
  labelKey: string
  value: string
  expanded: boolean
  onToggle: () => void
  last?: boolean
  navigates?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 py-1.5 text-left ${last ? '' : 'border-b border-white/10'}`}
    >
      <span className={`flex-1 text-[12px] text-white/90 ${expanded ? '' : 'truncate'}`}>
        <span className="font-semibold">
          <Str k={labelKey} />
        </span>{' '}
        {value}
      </span>
      {navigates ? (
        <ChevronRight size={14} className="text-white/70 shrink-0" />
      ) : (
        <ChevronDown
          size={14}
          className={`text-white/70 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  )
}
