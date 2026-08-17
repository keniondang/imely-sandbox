import { ChevronRight, MoreHorizontal, Camera, Grid2x2, UserCheck, Languages, Settings } from 'lucide-react'
import { Str, RichStr } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { MOCK_USER, ph } from '../data/mockContent'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'

export function ProfileScreen() {
  const {
    showToast,
    openProfileMenu,
    closeProfileMenu,
    openAccount,
    openPurchase,
    openMyCharacters,
    openFollowing,
    openBadges,
    openAppearance,
    openSettings,
    openAbout,
    baseLocale,
  } = useApp()
  // ProfileMenuSheet is rendered at the App.tsx level (see App.tsx), not
  // nested here — but it still needs to open when the Inspector jumps to a
  // string inside it, same as any other screen's local popup.
  usePopupRequest('profile', 'menu', (open) => (open ? openProfileMenu() : closeProfileMenu()))

  return (
    <div className="pb-6">
      {/* identity row */}
      <div className="px-4 flex items-center gap-3 mt-1">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full bg-cover bg-center border border-imely-line"
            style={{ backgroundColor: MOCK_USER.avatarColor }}
          />
          <button
            onClick={() => showToast('Ganti foto profil — segera hadir')}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-imely-line flex items-center justify-center active:scale-90 transition-transform"
          >
            <Camera size={12} className="text-imely-ink" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 font-bold text-imely-ink text-[17px]">
            <span className="truncate">{ph(MOCK_USER.name, baseLocale)}</span>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </div>
          <div className="text-gray-400 text-[13px] truncate">{MOCK_USER.handle}</div>
          <button
            onClick={openAccount}
            className="mt-1 text-[12px] font-semibold border border-imely-line rounded-full px-3 py-1 active:scale-95 active:bg-gray-50 transition-transform"
          >
            <Str k="profile_me_v4.menu.account_management" />
          </button>
        </div>
        <button onClick={openProfileMenu} className="active:scale-90 transition-transform">
          <MoreHorizontal className="text-gray-400" />
        </button>
      </div>

      {/* badge row */}
      <button
        onClick={openBadges}
        className="w-full px-4 mt-4 flex items-center justify-between active:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-2 bg-pink-50 rounded-full pl-2 pr-3 py-1">
          <span>🥉</span>
          <span className="text-[13px] font-semibold text-pink-500">
            <Str k={MOCK_USER.tierBadgeKey} />
          </span>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </button>

      {/* MeLy Club upgrade card */}
      <div className="mx-4 mt-4 rounded-2xl border border-imely-line p-4">
        <div className="font-extrabold text-[17px] text-imely-ink leading-snug">
          <RichStr k="profile_me_v4.banner_upgrade.title" />
        </div>
        <div className="text-[13px] text-gray-500 mt-0.5">
          <Str k="profile_me_v4.buy_gem_desc" />
        </div>

        <div className="mt-3 grid grid-cols-3 text-[13px] items-center">
          <div className="text-gray-400 font-medium">
            <Str k="profile_me_v4.banner_upgrade.feature_header" />
          </div>
          <div className="text-gray-400 font-medium text-center">
            <Str k="profile_me_v4.banner_upgrade.free_header" />
          </div>
          <div className="text-imely-primaryDark font-bold text-center bg-imely-mint rounded-t-lg py-1">
            <Str k="product_purchase.tab1" />
          </div>

          <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_daily_gem" free="100 💎" club="400 💎" />
          <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_unlimited_gem" free="X" club="800 💎" />
          <FeatureRow labelKey={null} label="Model AI canggih" free="X" club="Ya" />
          <FeatureRow labelKey={null} label="Jangan tampilkan iklan" free="X" club="Ya" />
          <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_avatar" free="X" club="Ya" last />
        </div>

        <button
          onClick={() => openPurchase('club')}
          className="mt-4 w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
        >
          <Str k="profile_me_v4.banner_upgrade.cta" />
        </button>
      </div>

      {/* gem balance */}
      <div className="mx-4 mt-3 rounded-2xl bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[12px] text-gray-400">
            <Str k="user_gem_overview.total" />:
          </div>
          <div className="font-bold text-imely-ink flex items-center gap-1">
            {MOCK_USER.gems.toLocaleString('id-ID')} 💎
          </div>
        </div>
        <button
          onClick={() => openPurchase('gem')}
          className="bg-imely-primary text-white text-[13px] font-bold rounded-full px-5 py-2 active:scale-95 active:bg-imely-primaryDark transition-transform"
        >
          <Str k="product_purchase.btn_buy" />
        </button>
      </div>

      <div className="mx-4 mt-2 text-center text-[11px] text-gray-300">Build - v30193 - 842 (556)</div>

      {/* list items */}
      <div className="mt-3">
        <ListRow
          icon={<Grid2x2 size={18} />}
          titleKey="profile_me_v4.my_companion_title"
          subtitleKey="profile_me_v4.my_companion_desc"
          onTap={openMyCharacters}
        />
        <ListRow
          icon={<UserCheck size={18} />}
          titleKey="profile_me_v4.following"
          subtitleKey="profile_me_v4.following_desc"
          onTap={openFollowing}
        />
        <ListRow
          icon={<Languages size={18} />}
          titleKey="setting_menu.font"
          subtitleKey="setting.font_setting.language_current"
          onTap={openAppearance}
        />
        <ListRow
          icon={<Settings size={18} />}
          titleKey="common.settings"
          subtitleKey="common.settings_desc"
          onTap={openSettings}
        />
      </div>

      {/* support section */}
      <div className="mt-2 border-t-8 border-imely-line pt-4">
        <div className="px-4 font-bold text-[16px] text-imely-ink">
          <Str k="profile_me_v4.support" />
        </div>
        <div className="mt-2">
          <SupportRow labelKey="profile_me_v4.send_email" onTap={() => showToast('Kirim masukan — segera hadir')} />
          <SupportRow labelKey="profile_me_v4.term_of_service" onTap={() => showToast('Ketentuan Layanan — segera hadir')} />
          <SupportRow labelKey="profile_me_v4.privacy_policy" onTap={() => showToast('Kebijakan Privasi — segera hadir')} />
          <SupportRow labelKey="profile_me_v4.copyright" onTap={() => showToast('Kebijakan Hak Cipta — segera hadir')} />
          <SupportRow labelKey="profile_me_v4.about_us" onTap={openAbout} />
        </div>
      </div>
    </div>
  )
}

function FeatureRow({
  labelKey,
  label,
  free,
  club,
  last,
}: {
  labelKey: string | null
  label?: string
  free: string
  club: string
  last?: boolean
}) {
  return (
    <>
      <div className="py-2 text-imely-ink text-[13px]">
        {labelKey ? <Str k={labelKey} /> : <NoSheet>{label}</NoSheet>}
      </div>
      <div className="py-2 text-center text-gray-400">{free}</div>
      <div className={`py-2 text-center font-semibold text-imely-primaryDark bg-imely-mint ${last ? 'rounded-b-lg' : ''}`}>
        {club}
      </div>
    </>
  )
}

function ListRow({
  icon,
  titleKey,
  subtitleKey,
  onTap,
}: {
  icon: React.ReactNode
  titleKey: string
  subtitleKey: string
  onTap: () => void
}) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-100 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">{icon}</div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-[14px] text-imely-ink">
          <Str k={titleKey} />
        </div>
        <div className="text-[12px] text-gray-400">
          <Str k={subtitleKey} />
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}

function SupportRow({ labelKey, onTap }: { labelKey: string; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between px-4 py-3 border-b border-imely-line last:border-0 active:bg-gray-100 transition-colors"
    >
      <div className="text-[14px] text-imely-ink">
        <Str k={labelKey} />
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}
