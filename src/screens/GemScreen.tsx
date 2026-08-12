import { useState } from 'react'
import { ArrowLeft, ChevronRight, Plus, Copy, Pencil, Check, X } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { ZoneScope } from '../context/ScreenScope'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { MOCK_USER, MOCK_INVITE_CODE, MOCK_GEM_MISSIONS } from '../data/mockContent'

// Placeholder — per-user gem lot breakdown, not xlsx content (see gem_history.*
// for the real column-header strings, used on the fuller history screen).
// Amounts sum to MOCK_USER.dailyGems so the detail modal stays consistent
// with the overview card behind it.
const DAILY_GEM_LOTS = [
  { amount: 100, expiresToday: true, date: null as string | null },
  { amount: 2146, expiresToday: false, date: '31/12/2026' },
]

export function GemScreen() {
  const { closeGems, openGemHistory, showToast } = useApp()
  const [dailyDetailOpen, setDailyDetailOpen] = useState(false)
  usePopupRequest('gems', 'popup', setDailyDetailOpen)

  function copyInviteCode() {
    navigator.clipboard?.writeText(MOCK_INVITE_CODE).catch(() => {})
    showToast('Kode disalin')
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* header */}
      <div className="flex items-center px-3 py-2.5 shrink-0">
        <button
          onClick={closeGems}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {/* gem overview card */}
        <div className="rounded-2xl border border-imely-line">
          <div className="text-center pt-4 pb-3">
            <div className="font-bold text-[15px] text-imely-ink">
              <Str k="user_gem_overview.persist" />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-[22px] font-extrabold text-imely-ink">{MOCK_USER.permanentGems}</span>
              <span className="text-lg">💎</span>
              <button
                onClick={() => showToast('Beli gem — segera hadir')}
                className="w-6 h-6 rounded-full bg-imely-primary text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="border-t border-imely-line px-4 py-3 text-[13.5px] text-imely-ink">
            <Str k="user_gem_overview.total" />: {MOCK_USER.gems.toLocaleString('id-ID')} 💎
          </div>

          <div className="border-t border-imely-line px-4 py-3 flex items-center justify-between">
            <div className="text-[13.5px] text-imely-ink">
              <Str k="user_gem_overview.expirable" />: {MOCK_USER.dailyGems.toLocaleString('id-ID')} 💎
            </div>
            <button
              onClick={() => setDailyDetailOpen(true)}
              className="text-[12.5px] font-semibold border border-imely-line rounded-full px-3.5 py-1.5 active:scale-95 active:bg-gray-50 transition-transform"
            >
              Detail
            </button>
          </div>

          <button
            onClick={openGemHistory}
            className="w-full border-t border-imely-line px-4 py-3 flex items-center justify-between active:bg-gray-50 transition-colors rounded-b-2xl"
          >
            <span className="text-[13.5px] text-imely-ink">
              <Str k="gem_detail.btn_history" />
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {/* MeLy Club upgrade card */}
        <div className="rounded-2xl border border-imely-line p-4">
          <div className="font-extrabold text-[17px] text-imely-ink leading-snug">
            Gabung <span className="text-imely-primary">MêLy Club</span>
          </div>
          <div className="text-[13px] text-gray-500 mt-0.5">Buka hak istimewa – Chat MêLy seru!</div>

          <div className="mt-3 grid grid-cols-3 text-[13px] items-center">
            <div className="text-gray-400 font-medium">
              <Str k="profile_me_v4.banner_upgrade.feature_header" />
            </div>
            <div className="text-gray-400 font-medium text-center">
              <Str k="profile_me_v4.banner_upgrade.free_header" />
            </div>
            <div className="text-imely-primaryDark font-bold text-center bg-imely-mint rounded-t-lg py-1">
              <Str k="profile_me_v4.banner_upgrade.club_header" />
            </div>

            <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_daily_gem" free="100 💎" club="400 💎" />
            <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_unlimited_gem" free="X" club="800 💎" />
            <FeatureRow label="Model AI canggih" free="X" club="Ya" />
            <FeatureRow label="Jangan tampilkan iklan" free="X" club="Ya" />
            <FeatureRow labelKey="profile_me_v4.banner_upgrade.feature_avatar" free="X" club="Ya" last />
          </div>

          <button
            onClick={() => showToast('Alur pembelian — segera hadir')}
            className="mt-4 w-full bg-imely-primary text-white font-bold rounded-full py-3 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
          >
            <Str k="profile_me_v4.banner_upgrade.cta" />
          </button>
        </div>

        {/* missions */}
        <div>
          <div className="font-bold text-[16px] text-imely-ink mb-2">
            <Str k="user_task.title" />
          </div>

          <div className="space-y-3">
            {/* invite friends */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="font-bold text-[14px] text-imely-ink">
                <Str k="user_task.btn_do_task_22" /> (0/5)
              </div>
              <div className="text-[12px] text-gray-500 leading-relaxed mt-1.5">
                <Str k="user_task.desc_22" /> 100💎
              </div>

              <button
                onClick={copyInviteCode}
                className="mt-3 w-full bg-white rounded-xl px-3 py-2.5 flex items-center justify-between active:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400 text-[13px]">
                  <Str k="user_task.invite_code_title" />
                </span>
                <span className="flex items-center gap-1.5 text-imely-primaryDark font-bold text-[14px]">
                  {MOCK_INVITE_CODE} <Copy size={14} />
                </span>
              </button>
            </div>

            {/* enter invite code */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="font-bold text-[14px] text-imely-ink">
                <Str k="user_task.txt_22_input_title" />
              </div>
              <div className="text-[12px] text-gray-400 mt-1">
                <Str k="user_task.txt_22_input_subtitle" />
              </div>
              <button
                onClick={() => showToast('Masukkan kode undangan — segera hadir')}
                className="mt-3 w-full flex items-center gap-2 border border-imely-primary rounded-full px-4 py-2.5 bg-imely-mint/40 text-imely-primaryDark text-[13px] font-medium active:scale-[0.98] transition-transform"
              >
                <Pencil size={14} />
                <Str k="user_task.txt_22_input_hint" />
              </button>
            </div>

            {/* watch ads */}
            <MissionCard
              titleNode={
                <>
                  <Str k="user_gem_overview.view_ads" /> ({MOCK_GEM_MISSIONS[0].progress})
                </>
              }
              limit={20}
              reward={MOCK_GEM_MISSIONS[0].reward}
              done={MOCK_GEM_MISSIONS[0].done}
              onDo={() => showToast('Tonton iklan — segera hadir')}
            />

            {/* lucky wheel */}
            <MissionCard
              titleNode={
                <>
                  <Str k="companion_header.banners.lucky_draw_title" /> Harian ({MOCK_GEM_MISSIONS[1].progress})
                </>
              }
              limit={1}
              reward={MOCK_GEM_MISSIONS[1].reward}
              done={MOCK_GEM_MISSIONS[1].done}
              onDo={() => showToast('Roda Keberuntungan — segera hadir')}
            />

            {/* daily gift — fully placeholder, not in the xlsx */}
            <MissionCard
              titleNode={<>Hadiah Harian ({MOCK_GEM_MISSIONS[2].progress})</>}
              limit={1}
              reward={MOCK_GEM_MISSIONS[2].reward}
              done={MOCK_GEM_MISSIONS[2].done}
              onDo={() => showToast('Hadiah harian — segera hadir')}
            />
          </div>
        </div>
      </div>

      {/* gem harian breakdown — opened from the "Detail" button on the overview card */}
      {dailyDetailOpen && (
        <ZoneScope zone="popup">
          <div className="absolute inset-0 z-10">
            <button
              onClick={() => setDailyDetailOpen(false)}
              aria-label="Close gem detail"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5 max-h-[70%] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[17px] text-imely-ink">
                  <Str k="user_gem_overview.title" />
                </div>
                <button
                  onClick={() => setDailyDetailOpen(false)}
                  className="text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-[14px] text-imely-ink">
                <div>
                  <Str k="user_gem_overview.total" />: <span className="font-bold">{MOCK_USER.gems.toLocaleString('id-ID')}</span>💎
                </div>
                <div>
                  <Str k="user_gem_overview.persist" />: <span className="font-bold">{MOCK_USER.permanentGems}</span> 💎
                </div>
                <div>
                  <Str k="user_gem_overview.expirable" />: <span className="font-bold">{MOCK_USER.dailyGems.toLocaleString('id-ID')}</span>💎
                  <div className="mt-1.5 space-y-1 text-[12.5px] text-gray-500">
                    {DAILY_GEM_LOTS.map((lot, i) => (
                      <div key={i}>
                        • {lot.amount}💎 <Str k="user_gem_overview.expire_at" /> 23:59{' '}
                        {lot.expiresToday ? <Str k="user_gem_overview.txt_today" /> : lot.date}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
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
  labelKey?: string
  label?: string
  free: string
  club: string
  last?: boolean
}) {
  return (
    <>
      <div className="py-2 text-imely-ink text-[13px]">{labelKey ? <Str k={labelKey} /> : label}</div>
      <div className="py-2 text-center text-gray-400">{free}</div>
      <div
        className={`py-2 text-center font-semibold text-imely-primaryDark bg-imely-mint ${last ? 'rounded-b-lg' : ''}`}
      >
        {club}
      </div>
    </>
  )
}

function MissionCard({
  titleNode,
  limit,
  reward,
  done,
  onDo,
}: {
  titleNode: React.ReactNode
  limit: number
  reward: string
  done: boolean
  onDo: () => void
}) {
  return (
    <div className="bg-gray-100 rounded-2xl p-4">
      <div className="font-bold text-[14px] text-imely-ink">{titleNode}</div>
      <div className="text-[12px] text-gray-400 mt-1">
        <Str k="user_task.txt_limit" /> {limit} <Str k="user_task.txt_count" />/<Str k="user_task.txt_day" />
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-imely-primaryDark font-bold text-[14px]">💎 {reward}</span>
        {done ? (
          <Check size={20} className="text-imely-primary" />
        ) : (
          <button
            onClick={onDo}
            className="bg-imely-primary text-white text-[12.5px] font-bold rounded-full px-4 py-1.5 active:scale-95 active:bg-imely-primaryDark transition-transform"
          >
            <Str k="user_task.btn_do_task" />
          </button>
        )}
      </div>
    </div>
  )
}
