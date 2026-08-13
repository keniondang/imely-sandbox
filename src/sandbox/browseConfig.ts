import {
  Home,
  MessageCircle,
  MessageSquare,
  User,
  UserCircle,
  UserCircle2,
  Bell,
  Gem,
  History,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  UserCog,
  Grid2x2,
  UserCheck,
  Award,
  Palette,
  Settings as SettingsIcon,
  Video,
} from 'lucide-react'
import type { ScreenId, FilterMode } from '../context/AppContext'

export type { FilterMode }

export const SCREEN_LABEL: Record<ScreenId, string> = {
  feed: 'Beranda (Feed)',
  chatlist: 'Obrolan (Chat list)',
  profile: 'Profil',
  chatdetail: 'Chat detail (overlay)',
  chatoptions: 'Opsi Chat (overlay)',
  characterprofile: 'Profil Karakter (overlay)',
  creatorprofile: 'Profil Kreator (overlay)',
  notification: 'Notifikasi (overlay)',
  gems: 'Gem (overlay)',
  gemhistory: 'Riwayat Gem (overlay)',
  purchase: 'Beli MeLy Club / Gem (overlay)',
  devices: 'Perangkat Masuk (overlay)',
  account: 'Kelola Akun (overlay)',
  mycharacters: 'Karaktermu (overlay)',
  following: 'Mengikuti (overlay)',
  badges: 'Lencana (overlay)',
  appearance: 'Tampilan (overlay)',
  settings: 'Pengaturan (overlay)',
  notificationsettings: 'Notifikasi Pengaturan (overlay)',
  videosettings: 'Video Pengaturan (overlay)',
}

export const SCREEN_ICON: Record<ScreenId, typeof Home> = {
  feed: Home,
  chatlist: MessageCircle,
  profile: User,
  chatdetail: MessageSquare,
  chatoptions: SlidersHorizontal,
  characterprofile: UserCircle,
  creatorprofile: UserCircle2,
  notification: Bell,
  gems: Gem,
  gemhistory: History,
  purchase: ShoppingBag,
  devices: Smartphone,
  account: UserCog,
  mycharacters: Grid2x2,
  following: UserCheck,
  badges: Award,
  appearance: Palette,
  settings: SettingsIcon,
  notificationsettings: Bell,
  videosettings: Video,
}

// Only the 3 bottom-nav tabs are top-level "pages" — every overlay screen
// nests under one of them, however many taps deep it actually takes to
// reach it in the real app.
export const PAGE_ORDER: ScreenId[] = ['feed', 'chatlist', 'profile']

// Overlays that only ever appear pushed on top of another overlay (never
// reached directly from a base tab) nest one level further under that
// parent — e.g. Opsi Chat only exists once Chat detail is already open.
export const SCREEN_PARENT: Partial<Record<ScreenId, ScreenId>> = {
  chatoptions: 'chatdetail',
  creatorprofile: 'characterprofile',
  gemhistory: 'gems',
  purchase: 'gems',
  notificationsettings: 'settings',
  videosettings: 'settings',
}

export const CHILD_SCREENS: Partial<Record<ScreenId, ScreenId[]>> = {
  chatdetail: ['chatoptions'],
  characterprofile: ['creatorprofile'],
  gems: ['gemhistory', 'purchase'],
  settings: ['notificationsettings', 'videosettings'],
}

// Which base page each "primary" overlay (one not already nested under
// another overlay per SCREEN_PARENT) sits under. Profil Karakter, Notifikasi,
// and Gem are all reachable from Beranda's content or its header; Chat
// detail is reachable from Obrolan's thread list.
export const PAGE_CHILDREN: Record<string, ScreenId[]> = {
  feed: ['characterprofile', 'notification', 'gems'],
  chatlist: ['chatdetail'],
  profile: ['devices', 'account', 'mycharacters', 'following', 'badges', 'appearance', 'settings'],
}

// Every screen resolved all the way up to its base page (chatoptions ->
// chatdetail -> chatlist, gemhistory -> gems -> feed, ...) — a page's own
// zones plus every one of its descendants, computed once so both the
// Inspector's tree and useBrowseOrder's flat row list can bucket by it.
const BASE_PAGE_OF: Record<string, ScreenId> = (() => {
  const map: Record<string, ScreenId> = {}
  for (const page of PAGE_ORDER) {
    map[page] = page
    for (const child of PAGE_CHILDREN[page] ?? []) {
      map[child] = page
      for (const grandchild of CHILD_SCREENS[child] ?? []) {
        map[grandchild] = page
      }
    }
  }
  return map
})()

// DFS traversal order — each page immediately followed by its overlay
// descendants (primary overlay, then that overlay's own pushed children) —
// so a page's rows are always one contiguous run for prev/next purposes.
export const SCREEN_ORDER: ScreenId[] = PAGE_ORDER.flatMap((page) => [
  page,
  ...(PAGE_CHILDREN[page] ?? []).flatMap((child) => [child, ...(CHILD_SCREENS[child] ?? [])]),
])

export function pageIdFor(screenId: ScreenId): ScreenId {
  return BASE_PAGE_OF[screenId] ?? screenId
}

// Minimal sequence to visit once at startup so every screen's key count is
// accurate in the Inspector from the very first render, not just after a
// translator happens to open it manually. Each entry also mounts its own
// ancestors (creatorprofile mounts characterprofile too, gemhistory mounts
// gems too, ...) since those stack as overlays rather than replacing each
// other — so this list only needs the deepest leaf of each branch.
export const WARM_UP_SCREENS: ScreenId[] = [
  'chatlist',
  'profile',
  'devices',
  'account',
  'mycharacters',
  'following',
  'badges',
  'appearance',
  'notificationsettings',
  'videosettings',
  'creatorprofile',
  'notification',
  'gemhistory',
  'purchase',
  'chatoptions',
]

// Display order + label for zones within a screen section. Zones not listed
// here (a screen introducing a new one later) still render, just alphabetically
// after these and labeled with their raw name.
export const ZONE_ORDER = [
  'page',
  'menu',
  'gem_detail',
  'invite_input',
  'lucky_wheel',
  'lucky_result',
  'block_confirm',
  'delete_confirm',
  'report',
  'mode_picker',
  'relationship',
  'role_summary',
  'role_edit',
  'club',
  'gem',
]
export const ZONE_LABEL: Record<string, string> = {
  page: 'Halaman',
  menu: 'Menu',
  gem_detail: 'Popup: Detail Gem',
  invite_input: 'Popup: Masukkan Kode',
  lucky_wheel: 'Popup: Roda Keberuntungan',
  lucky_result: 'Popup: Hasil Undian',
  block_confirm: 'Popup: Konfirmasi Blokir',
  delete_confirm: 'Popup: Konfirmasi Hapus',
  report: 'Popup: Laporkan',
  mode_picker: 'Popup: Mode Obrolan',
  relationship: 'Popup: Level Kedekatan',
  role_summary: 'Popup: Ganti Peran',
  role_edit: 'Popup: Edit Peran',
  club: 'Tab: MêLy Club',
  gem: 'Tab: Gem',
}

export function sortedZones(zones: string[]): string[] {
  return [...zones].sort((a, b) => {
    const ia = ZONE_ORDER.indexOf(a)
    const ib = ZONE_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

export const FILTERS: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'wired', label: 'Wired' },
  { id: 'unwired', label: 'Belum wired' },
  { id: 'overridden', label: 'Ada override' },
]
