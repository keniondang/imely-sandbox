import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { MOCK_GEM_ACTIVITY, MOCK_GEM_USAGE } from '../data/mockContent'

const COLS = 'grid grid-cols-[1.6fr_0.95fr_0.85fr_0.6fr] gap-x-2'

export function GemHistoryScreen() {
  const { closeGemHistory } = useApp()
  const [tab, setTab] = useState<'activity' | 'used'>('activity')

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeGemHistory}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-ink active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="gem_history.title" />
        </div>
      </div>

      <div className="flex justify-center gap-2 py-3 shrink-0">
        <TabButton active={tab === 'activity'} onClick={() => setTab('activity')}>
          <Str k="gem_history.tab1" />
        </TabButton>
        <TabButton active={tab === 'used'} onClick={() => setTab('used')}>
          <Str k="gem_history.tab2" />
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'activity' ? (
          <>
            <div className={`${COLS} px-4 py-2.5 border-b border-line text-[11px] font-semibold text-muted`}>
              <Str k="gem_history.receive_title_col1" />
              <Str k="gem_history.receive_title_col2" />
              <Str k="gem_history.receive_title_col3" />
              <Str k="gem_history.receive_title_col4" />
            </div>
            {MOCK_GEM_ACTIVITY.map((row) => (
              <div
                key={row.id}
                className={`${COLS} px-4 py-3 border-b border-line text-[12px] items-center ${
                  row.expired ? 'text-faint' : 'text-ink'
                }`}
              >
                <div className="leading-snug">{row.description}</div>
                <div>{row.receivedDate}</div>
                <div>{row.expiry}</div>
                <div className={`font-semibold ${row.expired ? 'text-faint' : 'text-imely-primaryDark'}`}>
                  {row.change}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className={`${COLS} px-4 py-2.5 border-b border-line text-[11px] font-semibold text-muted`}>
              <Str k="gem_history.send_title_col1" />
              <Str k="gem_history.send_title_col2" />
              <Str k="gem_history.send_title_col3" />
              <Str k="gem_history.send_title_col4" />
            </div>
            {MOCK_GEM_USAGE.map((row) => (
              <div
                key={row.id}
                className={`${COLS} px-4 py-3 border-b border-line text-[12px] items-center ${
                  row.expired ? 'text-faint' : 'text-ink'
                }`}
              >
                <div className="leading-snug">{row.content}</div>
                <div>{row.date}</div>
                <div>{row.feature ?? '-'}</div>
                <div className={`font-semibold ${row.expired ? 'text-faint' : 'text-imely-primaryDark'}`}>
                  {row.amount}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
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
      className={`rounded-full px-5 py-1.5 text-[13px] font-semibold border active:scale-95 transition-transform ${
        active
          ? 'border-imely-primary text-imely-primaryDark bg-imely-mint/40'
          : 'border-line text-muted bg-surface'
      }`}
    >
      {children}
    </button>
  )
}
