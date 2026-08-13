import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { MOCK_FEED_CHARACTERS } from '../data/mockContent'

// Same character/creator counts as Beranda — derived from the same data
// rather than a separate placeholder list, so the numbers stay consistent
// across the sandbox.
const CREATORS = Array.from(new Map(MOCK_FEED_CHARACTERS.map((c) => [c.creatorName, c])).values())

export function FollowingScreen() {
  const { closeFollowing, openCharacterProfile, openCreatorProfile, showToast } = useApp()
  const [tab, setTab] = useState<'characters' | 'creators'>('characters')

  function viewCharacter(id: string) {
    closeFollowing()
    openCharacterProfile(id)
  }

  function viewCreator(name: string) {
    closeFollowing()
    openCreatorProfile(name)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeFollowing}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="profile_me_v4.following" />
        </div>
      </div>

      <div className="flex justify-center gap-2 py-3 shrink-0">
        <TabButton active={tab === 'characters'} onClick={() => setTab('characters')}>
          <Str k="profile_creator.stat.characters" />
        </TabButton>
        <TabButton active={tab === 'creators'} onClick={() => setTab('creators')}>
          Pencipta
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'characters'
          ? MOCK_FEED_CHARACTERS.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => viewCharacter(c.id)} className="flex-1 flex items-center gap-3 text-left active:opacity-70 transition-opacity">
                  <div className="w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0">
                    <div className="font-bold text-[14.5px] text-imely-ink truncate">{c.name}</div>
                    <div className="text-[12px] text-gray-400">
                      {c.followers} <Str k="profile_creator.stat.followers" />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => showToast('Berhenti mengikuti — segera hadir')}
                  className="shrink-0 bg-gray-100 text-imely-ink text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 active:scale-95 transition-transform"
                >
                  <Str k="identity.follow.btn_followed" />
                </button>
              </div>
            ))
          : CREATORS.map((c) => (
              <div key={c.creatorName} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => viewCreator(c.creatorName)}
                  className="flex-1 flex items-center gap-3 text-left active:opacity-70 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-[14.5px] text-imely-ink truncate">{c.creatorName}</div>
                    <div className="text-[12px] text-gray-400">
                      {c.creatorFollowers} <Str k="profile_creator.stat.followers" />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => showToast('Berhenti mengikuti — segera hadir')}
                  className="shrink-0 bg-gray-100 text-imely-ink text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 active:scale-95 transition-transform"
                >
                  <Str k="identity.follow.btn_followed" />
                </button>
              </div>
            ))}
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
      className={`rounded-full px-6 py-1.5 text-[13px] font-semibold border active:scale-95 transition-transform ${
        active ? 'border-imely-primary text-imely-primaryDark bg-imely-mint/40' : 'border-imely-line text-gray-400 bg-white'
      }`}
    >
      {children}
    </button>
  )
}
