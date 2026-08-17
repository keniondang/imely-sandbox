import { useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Pencil,
  ShieldCheck,
  Lock,
  Mail,
  AtSign,
  User,
  KeyRound,
  CreditCard,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
  AlertTriangle,
  Globe,
  Link2,
  Check,
} from 'lucide-react'
import { Str, RichStr, useRegisterKeys } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { ZoneScope } from '../context/ScreenScope'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { resolveString } from '../lib/strings'
import { MOCK_USER, ph } from '../data/mockContent'

type PrivacyMode = 'only_me' | 'only_link' | 'public'
type GenderMode = 'male' | 'female' | 'other'
type ModalKind =
  | 'identity'
  | 'unlinkBlocked'
  | 'privacy'
  | 'gender'
  | 'birthdate'
  | 'bio'
  | 'logout'
  | null

const GENDER_KEY: Record<GenderMode, string> = {
  male: 'profile_me.gender_edit.male',
  female: 'profile_me.gender_edit.female',
  other: 'onboard.gender_other',
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
function shiftDay(d: Date, delta: number): Date {
  const n = new Date(d)
  n.setDate(n.getDate() + delta)
  return n
}
function shiftMonth(d: Date, delta: number): Date {
  const n = new Date(d)
  n.setMonth(n.getMonth() + delta)
  return n
}
function shiftYear(d: Date, delta: number): Date {
  const n = new Date(d)
  n.setFullYear(n.getFullYear() + delta)
  return n
}

export function AccountScreen() {
  const {
    closeAccount,
    openPurchase,
    openVerifyEmail,
    openUsername,
    openDeleteAccount,
    accountUsername,
    showToast,
    baseLocale,
  } = useApp()
  useRegisterKeys(['profile_me.id_identifier.hint_cccd', 'profile_me.bio_edit.input_box_hint'])
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)

  const [identityCard, setIdentityCard] = useState('')
  const [identityCardDraft, setIdentityCardDraft] = useState('')

  const [privacy, setPrivacy] = useState<PrivacyMode>('public')
  const [gender, setGender] = useState<GenderMode>('female')

  const [birthdate, setBirthdate] = useState(new Date(1990, 3, 1))
  const [birthdateDraft, setBirthdateDraft] = useState(birthdate)

  const [bio, setBio] = useState('')
  const [bioDraft, setBioDraft] = useState('')

  function closeModal() {
    setModal(null)
  }

  // Lets the Inspector open each of this screen's popups on demand — both for
  // "jump to string" and for the startup warm-up pass that registers their
  // content so it shows up under "Semua" without a translator having opened
  // them by hand first. `verify_menu` is its own boolean; the rest share the
  // `modal` union, so each just sets/clears its own slot in it.
  function modalPopup(kind: Exclude<ModalKind, null>) {
    return (open: boolean) => setModal((prev) => (open ? kind : prev === kind ? null : prev))
  }
  usePopupRequest('account', 'verify_menu', setVerifyOpen)
  usePopupRequest('account', 'identity_card_edit', modalPopup('identity'))
  usePopupRequest('account', 'unlink_blocked', modalPopup('unlinkBlocked'))
  usePopupRequest('account', 'privacy_menu', modalPopup('privacy'))
  usePopupRequest('account', 'gender_menu', modalPopup('gender'))
  usePopupRequest('account', 'birthdate_edit', modalPopup('birthdate'))
  usePopupRequest('account', 'bio_edit', modalPopup('bio'))
  usePopupRequest('account', 'logout_confirm', modalPopup('logout'))

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeAccount}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="profile_me_v4.menu.account_management" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full bg-cover bg-center border border-imely-line"
                style={{ backgroundColor: MOCK_USER.avatarColor }}
              />
              <button
                onClick={() => showToast('Ganti foto profil — segera hadir')}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-imely-line flex items-center justify-center active:scale-90 transition-transform"
              >
                <Camera size={10} className="text-imely-ink" />
              </button>
            </div>
            <div className="min-w-0">
              <button
                onClick={() => showToast('Ubah nama — segera hadir')}
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <span className="font-bold text-[17px] text-imely-ink truncate">{ph(MOCK_USER.name, baseLocale)}</span>
                <Pencil size={13} className="text-gray-400 shrink-0" />
              </button>
              <div className="text-[13px] text-gray-400">{MOCK_USER.handle.replace(' (internal)', '')}</div>
              <div className="text-[12.5px] text-gray-400">
                <Str k="user_profile_v2.login_by" /> {MOCK_USER.loginProvider}
              </div>
              <button
                onClick={() => openPurchase('club')}
                className="mt-1.5 bg-imely-primary text-white text-[12.5px] font-bold rounded-full px-4 py-1.5 active:scale-95 active:bg-imely-primaryDark transition-transform"
              >
                <Str k="member_card.upgrade" />
              </button>
            </div>
          </div>

          {/* verify banner */}
          <div className="mt-4 bg-sky-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-bold text-[14.5px] text-imely-ink">
              <ShieldCheck size={17} className="text-sky-500 shrink-0" />
              <Str k="user_profile_v2.banner_verify_acc.title_email" />
            </div>
            <div className="mt-1.5 text-[12.5px] text-gray-500 whitespace-pre-line leading-relaxed">
              <Str k="user_profile_v2.banner_verify_acc.description" />
            </div>
            <button
              onClick={() => setVerifyOpen(true)}
              className="mt-3 bg-imely-primary text-white text-[13px] font-bold rounded-full px-5 py-2 active:scale-95 active:bg-imely-primaryDark transition-transform"
            >
              <Str k="user_profile_v2.banner_verify_acc.button_verify" />
            </button>
          </div>
        </div>

        <div className="border-t-8 border-imely-line px-4 pt-4">
          <div className="font-bold text-[16px] text-imely-ink">
            <Str k="user_profile_v2.identifer.verify_account" />
          </div>

          <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-[12.5px] text-gray-500">
            <Lock size={14} className="shrink-0" />
            <Str k="user_profile_v2.identifer.only_show_with_you" />
          </div>

          <div className="mt-1">
            <AccountRow
              icon={<Mail size={18} />}
              titleKey="user_profile_v2.identifer.email"
              subtitleKey="user_profile_v2.identifer.add_email"
              onTap={openVerifyEmail}
            />
            <AccountRow
              icon={<AtSign size={18} />}
              title="User ID"
              subtitle={MOCK_USER.handle.replace(' (internal)', '')}
              onTap={() => showToast('User ID — segera hadir')}
            />
            <AccountRow
              icon={<User size={18} />}
              titleKey="user_profile_v2.identifer.username"
              subtitleKey={accountUsername ? undefined : 'user_profile_v2.identifer.create_username'}
              subtitle={accountUsername || undefined}
              onTap={openUsername}
            />
            <AccountRow
              icon={<KeyRound size={18} />}
              titleKey="user_profile_v2.identifer.password"
              subtitle={<RichStr k="user_profile_v2.identifer.create_password_hint" />}
              onTap={() => setVerifyOpen(true)}
            />
            <AccountRow
              icon={<CreditCard size={18} />}
              titleKey="user_profile_v2.identifer.identity_card"
              subtitleKey={identityCard ? undefined : 'user_profile_v2.identifer.add_identity_card'}
              subtitle={identityCard || undefined}
              onTap={() => {
                setIdentityCardDraft(identityCard)
                setModal('identity')
              }}
              last
            />
          </div>

          <div className="mt-4 text-[13px] font-semibold text-gray-400">
            <Str k="user_profile_v2.identifer.link_account" />
          </div>
          <LinkedAccountRow
            labelKey="user_profile_v2.identifer.link_account_fb"
            badge="f"
            badgeColor="#1877F2"
            actionKey="user_profile_v2.identifer.link_account_button"
            onTap={() => showToast('Hubungkan Facebook — segera hadir')}
          />
          <LinkedAccountRow
            labelKey="user_profile_v2.identifer.link_account_google"
            badge="G"
            badgeColor="#EA4335"
            actionKey="user_profile_v2.identifer.un_link_account_button"
            onTap={() => setModal('unlinkBlocked')}
            outlined
          />
          <div className="pb-4 pt-1 text-[11px] text-gray-400">
            <Str k="user_profile_v2.identifer.link_account_hint" />
          </div>
        </div>

        <div className="border-t-8 border-imely-line px-4 pt-4">
          <div className="font-bold text-[16px] text-imely-ink">
            <Str k="user_profile_v2.profile_info.title" />
          </div>
          <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2.5 text-[12.5px] text-gray-500">
            <Str k="user_profile_v2.profile_info.privacy_title" />
          </div>

          <div className="flex items-center justify-between py-3.5 border-b border-imely-line">
            <div className="text-[14px] text-imely-ink">
              <Str k="user_profile_v2.profile_info.privacy_mode" />
            </div>
            <button
              onClick={() => setModal('privacy')}
              className="flex items-center gap-1 text-[13px] font-medium text-imely-ink border border-imely-line rounded-full px-3 py-1 active:scale-95 transition-transform"
            >
              {privacy === 'only_me' ? (
                <>
                  🔒 <Str k="feed_privacy.mode.only_me" />
                </>
              ) : privacy === 'only_link' ? (
                <>
                  🔗 <Str k="feed_privacy.mode.only_link" />
                </>
              ) : (
                <>
                  🌐 <NoSheet>Publik</NoSheet>
                </>
              )}
              <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3.5 border-b border-imely-line">
            <div className="text-[14px] text-imely-ink">
              <Str k="user_profile_v2.profile_info.gender_mode" />
            </div>
            <button
              onClick={() => setModal('gender')}
              className="flex items-center gap-1 text-[13px] font-medium text-imely-ink border border-imely-line rounded-full px-3 py-1 active:scale-95 transition-transform"
            >
              <Str k={GENDER_KEY[gender]} /> <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => {
              setBirthdateDraft(birthdate)
              setModal('birthdate')
            }}
            className="w-full flex items-center justify-between py-3.5 border-b border-imely-line text-left active:bg-gray-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1 text-[14px] text-imely-ink">
                <Str k="user_profile_v2.profile_info.year_of_birth" />
                <Pencil size={12} className="text-gray-400" />
              </div>
              <div className="text-[12.5px] text-gray-500 mt-0.5">{fmtDate(birthdate)}</div>
            </div>
          </button>

          <button
            onClick={() => {
              setBioDraft(bio)
              setModal('bio')
            }}
            className="w-full flex items-center justify-between py-3.5 text-left active:bg-gray-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1 text-[14px] text-imely-ink">
                <Str k="user_profile_v2.profile_info.bio" />
                <Pencil size={12} className="text-gray-400" />
              </div>
              <div className="text-[12.5px] text-gray-400 mt-0.5">
                {bio || <Str k="user_profile_v2.profile_info.bio_hint" />}
              </div>
            </div>
          </button>
        </div>

        <div className="border-t-8 border-imely-line px-4">
          <button
            onClick={() => setModal('logout')}
            className="w-full flex items-center gap-3 py-4 text-left active:bg-gray-50 transition-colors"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="font-semibold text-[14px] text-red-500">
              <Str k="user_profile_v2.logout" />
            </span>
          </button>
        </div>

        <div className="border-t-8 border-imely-line py-5 text-center">
          <button
            onClick={openDeleteAccount}
            className="text-[12.5px] text-gray-400 underline active:opacity-70 transition-opacity"
          >
            <Str k="user_profile_v2.delete_account_AI_Hay" />
          </button>
        </div>
      </div>

      {/* Verifikasi Akun sheet */}
      {verifyOpen && (
        <ZoneScope zone="verify_menu">
          <div className="absolute inset-0 z-10">
            <button onClick={() => setVerifyOpen(false)} aria-label="Close verify menu" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-2 pb-6 px-5">
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto" />
              <div className="flex justify-center mt-4">
                <ShieldCheck size={44} className="text-sky-500" />
              </div>
              <div className="text-center font-bold text-[17px] text-imely-ink mt-2">
                <Str k="login.opt_verify_acc.hint_verify_account" />
              </div>
              <button
                onClick={() => {
                  setVerifyOpen(false)
                  openVerifyEmail()
                }}
                className="mt-5 w-full flex items-center justify-center gap-2 border border-imely-line rounded-full py-3 font-bold text-[14px] text-imely-ink active:scale-[0.97] transition-transform"
              >
                <Mail size={16} />
                <Str k="login.opt_verify_acc.btn_verify_by_email" />
              </button>
              <div className="mt-4 text-center text-[11.5px] text-gray-400 leading-relaxed">
                <RichStr k="login.option_login.policy_agreement" />
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Nomor identifikasi pribadi — input modal */}
      {modal === 'identity' && (
        <ZoneScope zone="identity_card_edit">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[15px] text-imely-ink">
                  <Str k="user_profile_v2.identifer.identity_card" />
                </div>
                <button onClick={closeModal} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <input
                  value={identityCardDraft}
                  onChange={(e) => setIdentityCardDraft(e.target.value)}
                  placeholder={resolveString('profile_me.id_identifier.hint_cccd', baseLocale)}
                  className="w-full text-[14px] text-imely-ink outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="flex justify-end gap-4 px-4 pb-4">
                <button onClick={closeModal} className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity">
                  <Str k="profile_me.id_identifier.btn_cancel" />
                </button>
                <button
                  onClick={() => {
                    setIdentityCard(identityCardDraft)
                    closeModal()
                  }}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="profile_me.id_identifier.btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Google unlink not allowed */}
      {modal === 'unlinkBlocked' && (
        <ZoneScope zone="unlink_blocked">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-imely-line">
                <AlertTriangle size={17} className="text-amber-500 shrink-0" />
                <div className="font-bold text-[14.5px] text-imely-ink">
                  <Str k="user_profile_v2.identifer.unlink_google_account_not_allowed" />
                </div>
              </div>
              <div className="p-4 text-[13.5px] text-imely-ink leading-relaxed">
                <Str k="user_profile_v2.identifer.unlink_last_login_method_error" />
              </div>
              <div className="px-4 pb-2">
                <button
                  onClick={() => {
                    closeModal()
                    openVerifyEmail()
                  }}
                  className="font-bold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="user_profile_v2.identifer.add_email_2" />
                </button>
              </div>
              <div className="px-4 pb-4 pt-2">
                <button onClick={closeModal} className="font-bold text-[14px] text-imely-ink active:opacity-70 transition-opacity">
                  <Str k="common.back" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Opsi Privasi sheet */}
      {modal === 'privacy' && (
        <ZoneScope zone="privacy_menu">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-6">
              <div className="flex items-center justify-between px-4 py-4 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="feed_privacy.header" />
                </div>
                <button onClick={closeModal} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <PrivacyOption
                icon={<Lock size={18} />}
                titleKey="feed_privacy.mode.only_me"
                hintKey="feed_privacy.mode.only_me_hint"
                selected={privacy === 'only_me'}
                onSelect={() => {
                  setPrivacy('only_me')
                  closeModal()
                }}
              />
              <PrivacyOption
                icon={<Link2 size={18} />}
                titleKey="feed_privacy.mode.only_link"
                hintKey="feed_privacy.mode.only_link_hint"
                selected={privacy === 'only_link'}
                onSelect={() => {
                  setPrivacy('only_link')
                  closeModal()
                }}
              />
              <PrivacyOption
                icon={<Globe size={18} />}
                titleKey="feed_privacy.mode.public"
                hintKey="feed_privacy.mode.public_hint"
                selected={privacy === 'public'}
                onSelect={() => {
                  setPrivacy('public')
                  closeModal()
                }}
              />
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Jenis kelamin sheet */}
      {modal === 'gender' && (
        <ZoneScope zone="gender_menu">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="profile_me.gender_edit.title" />
                </div>
                <button onClick={closeModal} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              {(['male', 'female', 'other'] as GenderMode[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g)
                    closeModal()
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-imely-line last:border-0 active:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-[14px] text-imely-ink">
                    <Str k={GENDER_KEY[g]} />
                  </span>
                  {gender === g && <Check size={16} className="text-imely-primary" />}
                </button>
              ))}
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Tanggal lahir — wheel picker */}
      {modal === 'birthdate' && (
        <ZoneScope zone="birthdate_edit">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-imely-line font-bold text-[16px] text-imely-ink">
                <Str k="user_profile_v2.profile_info.date_time_picker_title" />
              </div>
              <div className="flex justify-center gap-6 py-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setBirthdateDraft(shiftDay(birthdateDraft, -1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {shiftDay(birthdateDraft, -1).getDate()}
                  </button>
                  <div className="text-imely-ink text-[15px] font-semibold border-t border-b border-imely-primary py-2 px-2">
                    {String(birthdateDraft.getDate()).padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setBirthdateDraft(shiftDay(birthdateDraft, 1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {shiftDay(birthdateDraft, 1).getDate()}
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setBirthdateDraft(shiftMonth(birthdateDraft, -1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {MONTH_NAMES[shiftMonth(birthdateDraft, -1).getMonth()]}
                  </button>
                  <div className="text-imely-ink text-[15px] font-semibold border-t border-b border-imely-primary py-2 px-2">
                    {MONTH_NAMES[birthdateDraft.getMonth()]}
                  </div>
                  <button
                    onClick={() => setBirthdateDraft(shiftMonth(birthdateDraft, 1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {MONTH_NAMES[shiftMonth(birthdateDraft, 1).getMonth()]}
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setBirthdateDraft(shiftYear(birthdateDraft, -1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {shiftYear(birthdateDraft, -1).getFullYear()}
                  </button>
                  <div className="text-imely-ink text-[15px] font-semibold border-t border-b border-imely-primary py-2 px-2">
                    {birthdateDraft.getFullYear()}
                  </div>
                  <button
                    onClick={() => setBirthdateDraft(shiftYear(birthdateDraft, 1))}
                    className="text-gray-300 text-[14px] py-2 active:text-gray-400"
                  >
                    {shiftYear(birthdateDraft, 1).getFullYear()}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-4 px-4 pb-4">
                <button onClick={closeModal} className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity">
                  <Str k="common.cancel" />
                </button>
                <button
                  onClick={() => {
                    setBirthdate(birthdateDraft)
                    closeModal()
                  }}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="common.save" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Bio (Perkenalan Diri) */}
      {modal === 'bio' && (
        <ZoneScope zone="bio_edit">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="profile_me.bio_edit.title" />
                </div>
                <button onClick={closeModal} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  rows={4}
                  className="w-full text-[14px] text-imely-ink outline-none resize-none placeholder:text-gray-400"
                  placeholder={resolveString('profile_me.bio_edit.input_box_hint', baseLocale)}
                />
              </div>
              <div className="flex justify-end gap-4 px-4 pb-4">
                <button onClick={closeModal} className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity">
                  <Str k="profile_me.bio_edit.btn_cancel" />
                </button>
                <button
                  onClick={() => {
                    setBio(bioDraft)
                    closeModal()
                  }}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="profile_me.bio_edit.btn_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}

      {/* Keluar */}
      {modal === 'logout' && (
        <ZoneScope zone="logout_confirm">
          <div className="absolute inset-0 z-10">
            <button onClick={closeModal} aria-label="Close" className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5">
              <div className="font-bold text-[16px] text-imely-ink">
                <Str k="user_profile_v2.logout_action_title" />
              </div>
              <div className="mt-1.5 text-[13px] text-gray-500">
                <Str k="user_profile_v2.logout_action_msg" />
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={closeModal} className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity">
                  <Str k="user_profile_v2.logout_action_button_cancel" />
                </button>
                <button
                  onClick={() => {
                    closeModal()
                    showToast('Keluar — segera hadir')
                  }}
                  className="font-semibold text-[14px] text-imely-primaryDark active:opacity-70 transition-opacity"
                >
                  <Str k="user_profile_v2.logout_action_button_confirm" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}

function AccountRow({
  icon,
  titleKey,
  title,
  subtitleKey,
  subtitle,
  onTap,
  last,
}: {
  icon: React.ReactNode
  titleKey?: string
  title?: string
  subtitleKey?: string
  subtitle?: React.ReactNode
  onTap: () => void
  last?: boolean
}) {
  return (
    <button
      onClick={onTap}
      className={`w-full flex items-center gap-3 py-3.5 text-left active:bg-gray-50 transition-colors ${
        last ? '' : 'border-b border-imely-line'
      }`}
    >
      <div className="text-imely-ink shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-imely-ink">
          {titleKey ? <Str k={titleKey} /> : <NoSheet>{title}</NoSheet>}
        </div>
        <div className="text-[12.5px] text-gray-400 truncate">
          {subtitleKey ? <Str k={subtitleKey} /> : subtitle}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}

function LinkedAccountRow({
  labelKey,
  badge,
  badgeColor,
  actionKey,
  onTap,
  outlined,
}: {
  labelKey: string
  badge: string
  badgeColor: string
  actionKey: string
  onTap: () => void
  outlined?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[12px] font-bold shrink-0"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </div>
        <div className="text-[14px] text-imely-ink">
          <Str k={labelKey} />
        </div>
      </div>
      <button
        onClick={onTap}
        className={`text-[12.5px] font-semibold rounded-full px-3.5 py-1 active:scale-95 transition-transform ${
          outlined ? 'border border-imely-line text-imely-ink' : 'border border-imely-primary text-imely-primaryDark'
        }`}
      >
        <Str k={actionKey} />
      </button>
    </div>
  )
}

function PrivacyOption({
  icon,
  titleKey,
  title,
  hintKey,
  hint,
  selected,
  onSelect,
}: {
  icon: React.ReactNode
  titleKey?: string
  title?: string
  hintKey?: string
  hint?: string
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
          {titleKey ? <Str k={titleKey} /> : <NoSheet>{title}</NoSheet>}
        </div>
        <div className="text-[12.5px] text-gray-500 mt-0.5">
          {hintKey ? <Str k={hintKey} /> : <NoSheet>{hint}</NoSheet>}
        </div>
      </div>
      {selected && <Check size={18} className="text-imely-primary shrink-0 mt-0.5" />}
    </button>
  )
}
