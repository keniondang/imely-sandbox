import { createContext, useContext, type ReactNode } from 'react'
import type { ScreenId } from './AppContext'

const ScreenScopeCtx = createContext<ScreenId | null>(null)

export function ScreenScope({ id, children }: { id: ScreenId; children: ReactNode }) {
  return <ScreenScopeCtx.Provider value={id}>{children}</ScreenScopeCtx.Provider>
}

export function useScreenScope(): ScreenId {
  const ctx = useContext(ScreenScopeCtx)
  if (!ctx) throw new Error('useScreenScope must be used within a ScreenScope')
  return ctx
}
