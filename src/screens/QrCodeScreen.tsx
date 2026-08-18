import { ArrowLeft, ScanLine, Download, Share2, Link2, QrCode } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'
import { MOCK_USER } from '../data/mockContent'

// Cosmetic-only QR pattern — a real encoder is unnecessary for a
// localization preview (nothing scans it), just needs to visually read as a
// QR code. Deterministic per-cell "randomness" so it doesn't flicker/reflow
// between renders like Math.random() would.
const GRID = 21
function isDark(row: number, col: number) {
  return ((row * 928371 + col * 123457 + row * col * 97) % 5) < 2
}
const FINDER_SIZE = 7

function inFinder(row: number, col: number) {
  const corners = [
    [0, 0],
    [0, GRID - FINDER_SIZE],
    [GRID - FINDER_SIZE, 0],
  ]
  return corners.some(([r, c]) => row >= r && row < r + FINDER_SIZE && col >= c && col < c + FINDER_SIZE)
}

function FinderMark() {
  return (
    <div className="w-full h-full p-[8%] bg-imely-ink rounded-[15%]">
      <div className="w-full h-full p-[16%] bg-white rounded-[15%]">
        <div className="w-full h-full bg-imely-ink rounded-[15%]" />
      </div>
    </div>
  )
}

function QrGraphic() {
  const cells = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (inFinder(row, col)) continue
      // leave a blank window in the middle for the avatar overlay
      const mid = GRID / 2
      if (Math.abs(row - mid) < 4.5 && Math.abs(col - mid) < 4.5) continue
      if (!isDark(row, col)) continue
      cells.push(
        <div
          key={`${row}-${col}`}
          className="bg-imely-ink rounded-[1px]"
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
        />
      )
    }
  }

  return (
    <div className="relative w-full aspect-square bg-white rounded-2xl p-4">
      <div className="relative w-full h-full grid" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}>
        {cells}
        <div style={{ gridRow: '1 / span 7', gridColumn: '1 / span 7' }}>
          <FinderMark />
        </div>
        <div style={{ gridRow: '1 / span 7', gridColumn: `${GRID - FINDER_SIZE + 1} / span 7` }}>
          <FinderMark />
        </div>
        <div style={{ gridRow: `${GRID - FINDER_SIZE + 1} / span 7`, gridColumn: '1 / span 7' }}>
          <FinderMark />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[19%] aspect-square rounded-full border-4 border-white relative"
          style={{ backgroundColor: MOCK_USER.avatarColor }}
        >
          <div className="absolute -bottom-1 -right-1 w-[45%] aspect-square rounded-full bg-imely-primary border-2 border-white flex items-center justify-center">
            <span className="text-white text-[8px]">🐱</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QrCodeScreen() {
  const { closeQrCode, showToast } = useApp()

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="relative flex items-center justify-between px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeQrCode}
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 font-bold text-[16px] text-imely-ink">
          <Str k="profile_me_v4.menu.my_qr" />
        </div>
        <button
          onClick={() => showToast('Pindai Kode QR — segera hadir')}
          aria-label="Scan QR code"
          className="w-8 h-8 rounded-full flex items-center justify-center text-imely-ink shrink-0 active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ScanLine size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-10 flex flex-col items-center">
        <div className="w-full max-w-[280px]">
          <QrGraphic />
        </div>

        <div className="mt-6 text-center text-[13px] text-gray-500 leading-relaxed">
          <Str k="profile_me_v4.qr_connect_description" />
        </div>

        <div className="mt-8 w-full grid grid-cols-4 gap-2 pb-8">
          <ActionButton
            icon={<QrCode size={18} />}
            labelKey="profile_me_v4.share_qr_code"
            onClick={() => showToast('Bagikan Kode QR — segera hadir')}
          />
          <ActionButton
            icon={<Download size={18} />}
            labelKey="profile_me_v4.save_qr_image"
            onClick={() => showToast('Simpan gambar QR — segera hadir')}
          />
          <ActionButton
            icon={<Share2 size={18} />}
            labelKey="profile_me_v4.share_profile"
            onClick={() => showToast('Bagikan profil — segera hadir')}
          />
          <ActionButton
            icon={<Link2 size={18} />}
            labelKey="chat.message_menu.copy_link"
            onClick={() => showToast('Salin tautan — segera hadir')}
          />
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon,
  labelKey,
  onClick,
}: {
  icon: React.ReactNode
  labelKey: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 active:opacity-70 transition-opacity"
    >
      <div className="w-11 h-11 rounded-full border border-imely-line flex items-center justify-center text-imely-ink">
        {icon}
      </div>
      <span className="text-[10.5px] text-imely-ink text-center leading-tight whitespace-pre-line">
        <Str k={labelKey} />
      </span>
    </button>
  )
}
