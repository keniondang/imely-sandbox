import { useEffect, useState } from 'react'
import { ArrowLeft, Camera, ChevronDown, X, Plus, Maximize2, Lock, Globe, Check } from 'lucide-react'
import { Str } from '../components/Str'
import { ZoneScope } from '../context/ScreenScope'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { resolveString } from '../lib/strings'
import { MOCK_FEED_CHARACTERS } from '../data/mockContent'

type Gender = 'male' | 'female'
type Privacy = 'private' | 'public'

// Suggestion chips for "Gaya Komunikasi" — not xlsx content (no matching key
// exists for any of these), most likely AI-suggested tags in the real app
// rather than fixed localized copy.
const STYLE_SUGGESTIONS = [
  'Netral', 'Ringkas dan langsung ke intinya', 'Formal', 'Sarkastik',
  'Gen Z', 'Sastrawi', 'Banyak bicara', 'Positif',
]

export function CharacterFormScreen() {
  const { characterFormEditId, closeCharacterForm, locale, showToast } = useApp()
  const editing = characterFormEditId ? MOCK_FEED_CHARACTERS.find((c) => c.id === characterFormEditId) : undefined
  const isEdit = Boolean(editing)

  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [genderMenuOpen, setGenderMenuOpen] = useState(false)
  const [hashtags, setHashtags] = useState<string[]>([''])
  const [tagline, setTagline] = useState('')
  const [personality, setPersonality] = useState('')
  const [publicInfo, setPublicInfo] = useState('')
  const [biography, setBiography] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [npc, setNpc] = useState('')
  const [style, setStyle] = useState('')
  const [rules, setRules] = useState('')
  const [note, setNote] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('private')
  const [privacyMenuOpen, setPrivacyMenuOpen] = useState(false)
  usePopupRequest('characterform', 'gender_menu', setGenderMenuOpen)
  usePopupRequest('characterform', 'privacy_menu', setPrivacyMenuOpen)

  // Seed from the character being edited — only the fields that actually
  // have a source in MockCharacter; the rest (gender, hashtag, kepribadian,
  // karakter pendukung, gaya komunikasi, ...) have no mock equivalent yet,
  // so they just start blank even in edit mode.
  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setTagline(editing.tagline)
      setPublicInfo(editing.publicInfo)
      setBiography(editing.biography)
      setFirstMessage(editing.firstMessage)
    } else {
      setName('')
      setTagline('')
      setPublicInfo('')
      setBiography('')
      setFirstMessage('')
    }
    setGender(null)
    setHashtags([''])
    setPersonality('')
    setAdvancedOpen(false)
    setNpc('')
    setStyle('')
    setRules('')
    setNote('')
    setPrivacy('private')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterFormEditId])

  function updateHashtag(i: number, v: string) {
    setHashtags((prev) => prev.map((h, idx) => (idx === i ? v : h)))
  }
  function removeHashtag(i: number) {
    setHashtags((prev) => prev.filter((_, idx) => idx !== i))
  }
  function addHashtag() {
    setHashtags((prev) => [...prev, ''])
  }

  function addStyleSuggestion(word: string) {
    setStyle((prev) => (prev ? `${prev}, ${word}` : word))
  }

  function submit() {
    if (isEdit) {
      const msg = resolveString('edit_bot.text_updated_bot', locale)
      closeCharacterForm()
      showToast(msg)
    } else {
      const msg = resolveString('bot.character_created_success_with_name', locale).replace('XXX', name || '')
      closeCharacterForm()
      showToast(msg)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeCharacterForm}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k={isEdit ? 'edit_bot.update_title' : 'edit_bot.create_title'} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center">
          <button
            onClick={() => showToast('Avatar — segera hadir')}
            className="w-28 h-36 rounded-2xl border border-imely-line flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={editing ? { backgroundColor: editing.color } : undefined}
          >
            <Camera size={22} className="text-imely-ink" />
            <span className="text-[13px] font-semibold text-imely-ink">
              <Str k="bot.avatar" />
            </span>
          </button>
        </div>

        <div className="mt-4 text-[12.5px] text-gray-400 whitespace-pre-line">
          <Str k="edit_bot.prompt_subtitle" />
        </div>

        <Field labelKey="bot.character_name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={resolveString('edit_bot.name_hint', locale)}
            className="w-full bg-gray-100 rounded-xl px-3.5 py-3 text-[14px] text-imely-ink outline-none placeholder:text-gray-400"
          />
        </Field>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-bold text-[14px] text-imely-ink">
            <Str k="edit_bot.gender_title" />: *
          </span>
          <button
            onClick={() => setGenderMenuOpen(true)}
            className="flex items-center gap-1 bg-gray-100 rounded-xl px-3 py-1.5 text-[13px] text-imely-ink active:scale-95 transition-transform"
          >
            {gender ? <Str k={gender === 'male' ? 'edit_bot.gender_1' : 'edit_bot.gender_2'} /> : 'Pilih...'}
            <ChevronDown size={13} className="text-gray-400" />
          </button>
        </div>

        <div className="mt-4">
          <div className="font-bold text-[14px] text-imely-ink">
            <Str k="edit_bot.prompt_hashtag_title" />
          </div>
          <div className="text-[12.5px] text-gray-500 mt-0.5">
            <Str k="edit_bot.prompt_hashtag_subtitle" />
          </div>
          <div className="mt-2 space-y-2">
            {hashtags.map((h, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 rounded-xl px-3.5 py-3">
                <input
                  value={h}
                  onChange={(e) => updateHashtag(i, e.target.value)}
                  placeholder={resolveString('edit_bot.hashtag_hint', locale)}
                  className="flex-1 bg-transparent text-[14px] text-imely-ink outline-none placeholder:text-gray-400 min-w-0"
                />
                <button onClick={() => removeHashtag(i)} className="text-imely-ink shrink-0 active:scale-90 transition-transform">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addHashtag}
            className="mt-2 flex items-center gap-1.5 border border-imely-line rounded-xl px-3.5 py-2 text-[13px] font-semibold text-imely-ink active:scale-95 transition-transform"
          >
            <Plus size={14} />
            <Str k="edit_bot.hashtag_add_more" />
          </button>
        </div>

        <Field labelKey="edit_bot.prompt_tagline_title" required>
          <TextArea value={tagline} onChange={setTagline} placeholderKey="edit_bot.prompt_tagline_hint" />
        </Field>

        <Field labelKey="edit_bot.prompt_character_title" subtitleKey="edit_bot.prompt_character_subtitle" required>
          <TextArea value={personality} onChange={setPersonality} placeholderKey="edit_bot.prompt_character_hint" showCount />
        </Field>

        <Field labelKey="edit_bot.prompt_public_info_title" subtitleKey="edit_bot.prompt_public_info_subtitle" required>
          <TextArea value={publicInfo} onChange={setPublicInfo} placeholderKey="edit_bot.prompt_public_info_hint" />
        </Field>

        <div className="mt-5">
          <div className="font-bold text-[14px] text-imely-ink">
            <Str k="edit_bot.chat_setting.title" />
          </div>
          <div className="text-[12.5px] text-gray-500 mt-0.5">
            <Str k="edit_bot.chat_setting.subtitle" />
          </div>

          <div className="mt-3">
            <Field labelKey="edit_bot.prompt_backstory_title" required indent>
              <TextArea value={biography} onChange={setBiography} placeholderKey="edit_bot.prompt_backstory_hint" showCount />
            </Field>
            <Field labelKey="edit_bot.prompt_first_msg_title" required indent>
              <TextArea value={firstMessage} onChange={setFirstMessage} placeholderKey="edit_bot.prompt_first_msg_hint" showCount />
            </Field>
          </div>
        </div>

        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-1 mt-5 py-2 text-[13.5px] font-semibold text-gray-500 active:opacity-70 transition-opacity"
        >
          <Str k="bot.advanced_settings" />
          <ChevronDown size={14} className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        </button>

        {advancedOpen && (
          <>
            <Field labelKey="edit_bot.prompt_npc_title">
              <TextArea value={npc} onChange={setNpc} placeholderKey="edit_bot.prompt_npc_hint" />
            </Field>

            <div className="mt-5">
              <div className="font-bold text-[14px] text-imely-ink">
                <Str k="edit_bot.prompt_style_title" />
              </div>
              <div className="mt-2 text-[12.5px] text-gray-500">Saran:</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {STYLE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => addStyleSuggestion(s)}
                    className="border border-imely-line rounded-full px-3 py-1 text-[12px] text-imely-ink active:scale-95 transition-transform"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <TextArea value={style} onChange={setStyle} placeholderKey="edit_bot.prompt_hint_3" />
              </div>
            </div>

            <Field labelKey="edit_bot.prompt_rule_title">
              <TextArea value={rules} onChange={setRules} placeholderKey="edit_bot.prompt_rule_hint" />
            </Field>

            <div className="mt-5">
              <div className="font-bold text-[14px] text-imely-ink">
                <Str k="edit_bot.prompt_note_title" />
              </div>
              <div className="text-[12.5px] text-gray-500 mt-0.5">
                <Str k="edit_bot.prompt_note_subtitle" />
              </div>
              <div className="mt-2">
                <TextArea value={note} onChange={setNote} placeholderKey="edit_bot.prompt_note_hint" />
              </div>
            </div>

            <button
              onClick={() => setPrivacyMenuOpen(true)}
              className="w-full flex items-center justify-between mt-5 py-3 border-t border-imely-line text-left active:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-[14px] text-imely-ink">
                <Lock size={15} className="text-gray-500" />
                <Str k="edit_bot.privacy_title" />
              </span>
              <span className="flex items-center gap-1 text-[13px] text-gray-500">
                <Str k={privacy === 'private' ? 'edit_bot.privacy_private_title' : 'edit_bot.privacy_public_title'} />
                <ChevronDown size={13} className="text-gray-400" />
              </span>
            </button>
          </>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-imely-line">
        <button
          onClick={submit}
          className="w-full bg-imely-primary text-white font-bold rounded-full py-3.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
        >
          <Str k={isEdit ? 'edit_bot.btn_update' : 'edit_bot.btn_create'} />
        </button>
      </div>

      {genderMenuOpen && (
        <ZoneScope zone="gender_menu">
          <div className="absolute inset-0 z-10">
            <button onClick={() => setGenderMenuOpen(false)} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="edit_bot.gender_title" />
                </div>
                <button onClick={() => setGenderMenuOpen(false)} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              {(['male', 'female'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g)
                    setGenderMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-imely-line last:border-0 active:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-[14px] text-imely-ink">
                    <Str k={g === 'male' ? 'edit_bot.gender_1' : 'edit_bot.gender_2'} />
                  </span>
                  {gender === g && <Check size={16} className="text-imely-primary" />}
                </button>
              ))}
            </div>
          </div>
        </ZoneScope>
      )}

      {privacyMenuOpen && (
        <ZoneScope zone="privacy_menu">
          <div className="absolute inset-0 z-10">
            <button onClick={() => setPrivacyMenuOpen(false)} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-6">
              <div className="flex items-center justify-between px-4 py-4 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="edit_bot.privacy_title" />
                </div>
                <button onClick={() => setPrivacyMenuOpen(false)} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <PrivacyOption
                icon={<Lock size={18} />}
                titleKey="edit_bot.privacy_private_title"
                hint="Hanya kamu yang bisa melihat. Orang yang punya tautannya pun nggak bisa buka."
                selected={privacy === 'private'}
                onSelect={() => {
                  setPrivacy('private')
                  setPrivacyMenuOpen(false)
                }}
              />
              <PrivacyOption
                icon={<Globe size={18} />}
                titleKey="edit_bot.privacy_public_title"
                hint="Semua pengguna bisa lihat."
                selected={privacy === 'public'}
                onSelect={() => {
                  setPrivacy('public')
                  setPrivacyMenuOpen(false)
                }}
              />
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}

function Field({
  labelKey,
  subtitleKey,
  required,
  indent,
  children,
}: {
  labelKey: string
  subtitleKey?: string
  required?: boolean
  indent?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`mt-4 ${indent ? 'ml-1' : ''}`}>
      <div className="font-bold text-[14px] text-imely-ink">
        <Str k={labelKey} />
        {required && !labelKey.includes('title') ? ' *' : ''}
      </div>
      {subtitleKey && (
        <div className="text-[12.5px] text-gray-500 mt-0.5">
          <Str k={subtitleKey} />
        </div>
      )}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function TextArea({
  value,
  onChange,
  placeholderKey,
  showCount,
}: {
  value: string
  onChange: (v: string) => void
  placeholderKey: string
  showCount?: boolean
}) {
  const { locale } = useApp()
  return (
    <div className="relative bg-gray-100 rounded-xl">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolveString(placeholderKey, locale)}
        rows={4}
        className="w-full bg-transparent px-3.5 py-3 text-[14px] text-imely-ink outline-none resize-none placeholder:text-gray-400"
      />
      <Maximize2 size={14} className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
      {showCount && (
        <div className="absolute bottom-2 left-3.5 text-[11px] text-gray-400">{value.length} karakter</div>
      )}
    </div>
  )
}

function PrivacyOption({
  icon,
  titleKey,
  hint,
  selected,
  onSelect,
}: {
  icon: React.ReactNode
  titleKey: string
  hint: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
        selected ? 'bg-imely-mint/40' : 'active:bg-gray-50'
      }`}
    >
      <div className="text-imely-ink shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[14.5px] text-imely-ink">
          <Str k={titleKey} />
        </div>
        <div className="text-[12.5px] text-gray-500 mt-0.5">{hint}</div>
      </div>
      {selected && <Check size={18} className="text-imely-primary shrink-0 mt-0.5" />}
    </button>
  )
}
