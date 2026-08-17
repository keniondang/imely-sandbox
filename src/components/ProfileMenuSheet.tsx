import { UserCircle, Smartphone } from 'lucide-react'
import { Str } from './Str'
import { ScreenScope, ZoneScope } from '../context/ScreenScope'

interface ProfileMenuSheetProps {
  open: boolean
  onClose: () => void
  onKelolaAkun: () => void
  onPerangkatMasuk: () => void
}

// Profile's account "Opsi" sheet (3-dot button next to the identity row) —
// explicitly wrapped in its own ScreenScope/ZoneScope since it's rendered as
// a phone-frame-level overlay (see App.tsx) rather than nested inside
// ProfileScreen's own scrollable content.
export function ProfileMenuSheet({ open, onClose, onKelolaAkun, onPerangkatMasuk }: ProfileMenuSheetProps) {
  if (!open) return null
  return (
    <ScreenScope id="profile">
      <ZoneScope zone="menu">
        <div className="h-full relative">
          <button onClick={onClose} aria-label="Close options" className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-imely-line">
              <div className="font-bold text-[16px] text-imely-ink">
                <Str k="profile_menu.header" />
              </div>
              <button onClick={onClose} className="text-gray-400 active:scale-90 transition-transform">
                ✕
              </button>
            </div>
            <button
              onClick={onKelolaAkun}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
            >
              <UserCircle size={18} className="text-imely-ink" />
              <span className="text-[14px] text-imely-ink">
                <Str k="profile_me_v4.menu.account_management" />
              </span>
            </button>
            <button
              onClick={onPerangkatMasuk}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
            >
              <Smartphone size={18} className="text-imely-ink" />
              <span className="text-[14px] text-imely-ink">
                <Str k="profile_me_v4.menu.login_managment" />
              </span>
            </button>
            <div className="h-2" />
          </div>
        </div>
      </ZoneScope>
    </ScreenScope>
  )
}
