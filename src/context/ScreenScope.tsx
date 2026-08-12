import { createContext, useContext, type ReactNode } from 'react'
import type { ScreenId, Zone } from './AppContext'

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
// content and jump straight to it (see hooks/usePopupRequest.ts).
export function ZoneScope({ zone, children }: { zone: Zone; children: ReactNode }) {
  return <ZoneScopeCtx.Provider value={zone}>{children}</ZoneScopeCtx.Provider>
}

export function useZoneScope(): Zone {
  return useContext(ZoneScopeCtx)
}
