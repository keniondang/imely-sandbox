import { Camera, Image, Eye, UserCircle } from 'lucide-react'
import { Str } from './Str'
import { ScreenScope, ZoneScope } from '../context/ScreenScope'

interface AvatarMenuSheetProps {
  open: boolean
  onClose: () => void
  onTakePhoto: () => void
  onChooseGallery: () => void
  onViewPhoto: () => void
  onManageAccount: () => void
}

// Opened from the camera badge on the avatar — both on the Profile tab and
// on your own (self-mode) Creator Profile show the exact same real menu, so
// this is shared rather than duplicated. Rendered as a phone-frame-level
// overlay (see App.tsx), same reasoning as ProfileMenuSheet: neither caller
// screen has its own relative-positioned wrapper to absolutely-position
// this inside.
export function AvatarMenuSheet({
  open,
  onClose,
  onTakePhoto,
  onChooseGallery,
  onViewPhoto,
  onManageAccount,
}: AvatarMenuSheetProps) {
  if (!open) return null
  return (
    <ScreenScope id="profile">
      <ZoneScope zone="avatar_menu">
        <div className="h-full relative">
          <button onClick={onClose} aria-label="Close options" className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-line">
              <div className="font-bold text-[16px] text-ink">
                <Str k="user_avatar_menu.container_title" />
              </div>
              <button onClick={onClose} className="text-muted active:scale-90 transition-transform">
                ✕
              </button>
            </div>
            <button
              onClick={onTakePhoto}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
            >
              <Camera size={18} className="text-ink" />
              <span className="text-[14px] text-ink">
                <Str k="user_avatar_menu.take_photo" />
              </span>
            </button>
            <button
              onClick={onChooseGallery}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
            >
              <Image size={18} className="text-ink" />
              <span className="text-[14px] text-ink">
                <Str k="user_avatar_menu.pick_from_gallery" />
              </span>
            </button>
            <button
              onClick={onViewPhoto}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-line active:bg-subtle transition-colors text-left"
            >
              <Eye size={18} className="text-ink" />
              <span className="text-[14px] text-ink">
                <Str k="user_avatar_menu.view_photo" />
              </span>
            </button>
            <button
              onClick={onManageAccount}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-subtle transition-colors text-left"
            >
              <UserCircle size={18} className="text-ink" />
              <span className="text-[14px] text-ink">
                <Str k="profile_me_v4.menu.account_management" />
              </span>
            </button>
            <div className="h-2" />
          </div>
        </div>
      </ZoneScope>
    </ScreenScope>
  )
}
