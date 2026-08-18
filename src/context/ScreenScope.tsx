import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useApp, type ScreenId, type Zone } from './AppContext'

const ScreenScopeCtx = createContext<ScreenId | null>(null)
const ZoneScopeCtx = createContext<Zone>('page')

export function ScreenScope({ id, children }: { id: ScreenId; children: ReactNode }) {
  return (
    <ScreenScopeCtx.Provider value={id}>
      <ZoneScopeCtx.Provider value="page">{children}</ZoneScopeCtx.Provider>
    </ScreenScopeCtx.Provider>
  )
}

export function useScreenScope(): ScreenId {
  const ctx = useContext(ScreenScopeCtx)
  if (!ctx) throw new Error('useScreenScope must be used within a ScreenScope')
  return ctx
}

// Marks a sub-surface within a screen — a bottom sheet, a modal — as its own
// zone, so the Inspector can list it separately from the screen's main page
// content and jump straight to it (see hooks/usePopupRequest.ts). Also
// reports its own mount/unmount to AppContext's liveZone — the reverse of
// requestPopup: a translator opening this menu/popup by tapping it directly
// in the live preview (not via the Inspector) is exactly the signal the
// Inspector needs to auto-follow along (see Inspector.tsx's liveZone effect).
export function ZoneScope({ zone, children }: { zone: Zone; children: ReactNode }) {
  const screenId = useScreenScope()
  const { registerLiveZone, unregisterLiveZone } = useApp()

  useEffect(() => {
    registerLiveZone(screenId, zone)
    return () => unregisterLiveZone(screenId, zone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenId, zone])

  return <ZoneScopeCtx.Provider value={zone}>{children}</ZoneScopeCtx.Provider>
}

export function useZoneScope(): Zone {
  return useContext(ZoneScopeCtx)
}
