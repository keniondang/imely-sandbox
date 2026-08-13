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
} from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { MOCK_USER } from '../data/mockContent'

export function AccountScreen() {
  const { closeAccount, openPurchase, showToast } = useApp()

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeAccount}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">Kelola akun</div>
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
                <span className="font-bold text-[17px] text-imely-ink truncate">{MOCK_USER.name}</span>
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
              onClick={() => showToast('Verifikasi akun — segera hadir')}
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
              onTap={() => showToast('Email — segera hadir')}
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
              subtitleKey="user_profile_v2.identifer.create_username"
              onTap={() => showToast('Nama Pengguna — segera hadir')}
            />
            <AccountRow
              icon={<KeyRound size={18} />}
              titleKey="user_profile_v2.identifer.password"
              subtitle={
                <>
                  Buat kata sandi setelah akunmu{' '}
                  <span className="text-imely-primaryDark font-semibold">diverifikasi</span>...
                </>
              }
              onTap={() => showToast('Kata sandi — segera hadir')}
            />
            <AccountRow
              icon={<CreditCard size={18} />}
              titleKey="user_profile_v2.identifer.identity_card"
              subtitleKey="user_profile_v2.identifer.add_identity_card"
              onTap={() => showToast('Nomor identifikasi pribadi — segera hadir')}
              last
            />
          </div>

          <div className="mt-4 text-[13px] font-semibold text-gray-400">
            <Str k="user_profile_v2.identifer.link_account" />
          </div>
          <LinkedAccountRow
            label="Facebook"
            badge="f"
            badgeColor="#1877F2"
            actionKey="user_profile_v2.identifer.link_account_button"
            onTap={() => showToast('Hubungkan Facebook — segera hadir')}
          />
          <LinkedAccountRow
            label="Google"
            badge="G"
            badgeColor="#EA4335"
            actionKey="user_profile_v2.identifer.un_link_account_button"
            onTap={() => showToast('Putuskan Google — segera hadir')}
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
              onClick={() => showToast('Privasi — segera hadir')}
              className="flex items-center gap-1 text-[13px] font-medium text-imely-ink border border-imely-line rounded-full px-3 py-1 active:scale-95 transition-transform"
            >
              🌐 Publik <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3.5 border-b border-imely-line">
            <div className="text-[14px] text-imely-ink">
              <Str k="user_profile_v2.profile_info.gender_mode" />
            </div>
            <button
              onClick={() => showToast('Jenis kelamin — segera hadir')}
              className="flex items-center gap-1 text-[13px] font-medium text-imely-ink border border-imely-line rounded-full px-3 py-1 active:scale-95 transition-transform"
            >
              <Str k="user_profile_v2.profile_info.gender_picker_female" /> <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => showToast('Tanggal lahir — segera hadir')}
            className="w-full flex items-center justify-between py-3.5 border-b border-imely-line text-left active:bg-gray-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1 text-[14px] text-imely-ink">
                <Str k="user_profile_v2.profile_info.year_of_birth" />
                <Pencil size={12} className="text-gray-400" />
              </div>
              <div className="text-[12.5px] text-gray-500 mt-0.5">{MOCK_USER.birthdate}</div>
            </div>
          </button>

          <button
            onClick={() => showToast('Perkenalan Diri — segera hadir')}
            className="w-full flex items-center justify-between py-3.5 text-left active:bg-gray-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1 text-[14px] text-imely-ink">
                <Str k="user_profile_v2.profile_info.bio" />
                <Pencil size={12} className="text-gray-400" />
              </div>
              <div className="text-[12.5px] text-gray-400 mt-0.5">
                <Str k="user_profile_v2.profile_info.bio_hint" />
              </div>
            </div>
          </button>
        </div>

        <div className="border-t-8 border-imely-line px-4">
          <button
            onClick={() => showToast('Keluar — segera hadir')}
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
            onClick={() => showToast('Hapus akun — segera hadir')}
            className="text-[12.5px] text-gray-400 underline active:opacity-70 transition-opacity"
          >
            <Str k="user_profile_v2.delete_account_AI_Hay" />
          </button>
        </div>
      </div>
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
        <div className="font-semibold text-[14px] text-imely-ink">{titleKey ? <Str k={titleKey} /> : title}</div>
        <div className="text-[12.5px] text-gray-400 truncate">
          {subtitleKey ? <Str k={subtitleKey} /> : subtitle}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}

function LinkedAccountRow({
  label,
  badge,
  badgeColor,
  actionKey,
  onTap,
  outlined,
}: {
  label: string
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
        <div className="text-[14px] text-imely-ink">{label}</div>
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
