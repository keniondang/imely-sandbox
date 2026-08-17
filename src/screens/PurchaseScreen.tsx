import { useState } from 'react'
import { X, ArrowRight, CircleCheck } from 'lucide-react'
import { Str, RichStr } from '../components/Str'
import { NoSheet } from '../components/NoSheet'
import { useApp, type PurchaseTab } from '../context/AppContext'
import { ZoneScope } from '../context/ScreenScope'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { MOCK_CLUB_PLANS, MOCK_GEM_PACKS } from '../data/mockContent'

export function PurchaseScreen() {
  const { closePurchase, purchaseTab } = useApp()
  const [tab, setTab] = useState<PurchaseTab>(purchaseTab)
  const [planId, setPlanId] = useState<'monthly' | 'yearly'>('monthly')
  const [packId, setPackId] = useState(MOCK_GEM_PACKS[0].id)

  // The two tabs are modeled as zones so the Inspector can jump straight to
  // a "Gem" tab-only string (or "MêLy Club" tab-only string) even if this
  // screen is already open showing the other tab — same mechanism as any
  // other popup/menu, see hooks/usePopupRequest.ts.
  usePopupRequest('purchase', 'club', (open) => open && setTab('club'))
  usePopupRequest('purchase', 'gem', (open) => open && setTab('gem'))

  const plan = MOCK_CLUB_PLANS.find((p) => p.id === planId)!
  const pack = MOCK_GEM_PACKS.find((p) => p.id === packId)!

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        {/* hero */}
        <div className="relative h-44 shrink-0 bg-gradient-to-br from-imely-primaryDark via-imely-primary to-imely-mint flex items-center justify-center overflow-hidden">
          <button
            onClick={closePurchase}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/25 text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>
          <div className="font-extrabold text-white text-[32px] italic tracking-tight drop-shadow-sm">
            <Str k="product_purchase.tab1" />
          </div>
        </div>

        <div className="flex justify-center gap-2 py-3 px-4">
          <TabButton active={tab === 'club'} onClick={() => setTab('club')}>
            <Str k="product_purchase.tab1" />
          </TabButton>
          <TabButton active={tab === 'gem'} onClick={() => setTab('gem')}>
            <Str k="product_purchase.tab2" />
          </TabButton>
        </div>

        <ZoneScope zone={tab}>
        {tab === 'club' ? (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="font-bold text-[14px] text-imely-ink mb-2">
                <Str k="product_purchase.benefit_title" />:
              </div>
              <ul className="space-y-1.5 text-[13px] text-imely-ink">
                <li>
                  • <Str k="product_purchase.benefit_1" />: 400💎
                </li>
                <li>
                  • <Str k="product_purchase.benefit_2" />: 800💎
                </li>
                <li>
                  • <NoSheet>Model AI canggih</NoSheet>
                </li>
                <li>
                  • <Str k="product_purchase.benefit_3" />
                </li>
                <li>
                  • <NoSheet>Jangan tampilkan iklan</NoSheet>
                </li>
                <li>
                  • <Str k="product_purchase.benefit_4" />
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              {MOCK_CLUB_PLANS.map((p) => {
                const active = p.id === planId
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlanId(p.id)}
                    className={`relative w-full text-left rounded-2xl border p-3.5 flex items-center justify-between transition-colors ${
                      active ? 'border-imely-primary bg-imely-mint/30' : 'border-imely-line bg-white'
                    }`}
                  >
                    <span className="absolute -top-2.5 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Str k="product_purchase.subs_discount" />: {p.discountPct}%
                    </span>
                    <div className="mt-1.5">
                      <div className="text-[13px] font-semibold text-imely-primaryDark">
                        <Str k={p.labelKey} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-extrabold text-[16px] text-imely-ink">{p.price}</span>
                        <span className="text-[12px] text-gray-400 line-through">{p.oldPrice}</span>
                      </div>
                    </div>
                    {active && <CircleCheck size={20} className="text-imely-primary shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="text-[11px] text-gray-400">
              <Str k="product_purchase.subs_note" />
            </div>

            <div className="text-[10.5px] text-gray-400 leading-relaxed">
              <RichStr k="product_purchase.term_of_use" />
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              {MOCK_GEM_PACKS.map((p) => {
                const active = p.id === packId
                return (
                  <button
                    key={p.id}
                    onClick={() => setPackId(p.id)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                      active ? 'border-imely-primary bg-imely-mint/30' : 'border-imely-line bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold text-[14px] text-imely-ink">
                      {active ? (
                        <CircleCheck size={18} className="text-imely-primary" />
                      ) : (
                        <span className="w-[18px] h-[18px] rounded-full border border-gray-300" />
                      )}
                      {p.amount.toLocaleString('id-ID')} 💎
                    </span>
                    <span className="font-bold text-[14px] text-imely-ink">{p.price}</span>
                  </button>
                )
              })}
            </div>

            <div className="text-[11px] text-gray-400">
              <Str k="product_purchase.gem_note" />
            </div>
          </div>
        )}
        </ZoneScope>
      </div>

      <ZoneScope zone={tab}>
        <div className="shrink-0 p-4 border-t border-imely-line">
          <button className="w-full bg-imely-primary text-white font-bold rounded-full py-3 flex items-center justify-center gap-2 active:scale-[0.97] active:bg-imely-primaryDark transition-transform">
            <span className="flex-1 text-right">
              {tab === 'club' ? (
                <>
                  <div>
                    <Str k="product_purchase.btn_buy_subs" />
                  </div>
                  <div className="text-[12px] font-normal opacity-90">
                    <Str
                      k={planId === 'monthly' ? 'product_purchase.subs_price_desc_1_1' : 'product_purchase.subs_price_desc_1_2'}
                    />{' '}
                    {plan.price}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Str k="product_purchase.btn_buy_gem" />
                  </div>
                  <div className="text-[12px] font-normal opacity-90">
                    {pack.price}/{pack.amount.toLocaleString('id-ID')} <Str k="product_purchase.tab2" />
                  </div>
                </>
              )}
            </span>
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight size={15} />
            </span>
          </button>
        </div>
      </ZoneScope>
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
