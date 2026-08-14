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
  Info,
  Mail,
  AtSign,
  Trash2,
  UserPlus,
} from 'lucide-react'
import type { ScreenId, FilterMode } from '../context/AppContext'

export type { FilterMode }

// Labels for the Inspector's own navigation tree — English, since this is
// tool chrome, not simulated app content (the phone preview still shows
// whatever locale is selected via its own real <Str> keys regardless of
// what these say). The original Indonesian screen name stays in parens
// where it isn't obvious from the English alone, so a translator can still
// match a label back to the real app.
export const SCREEN_LABEL: Record<ScreenId, string> = {
  feed: 'Feed (Beranda)',
  chatlist: 'Chat List (Obrolan)',
  profile: 'Profile (Profil)',
  chatdetail: 'Chat Detail',
  chatoptions: 'Chat Options',
  characterprofile: 'Character Profile',
  creatorprofile: 'Creator Profile',
  notification: 'Notifications',
  gems: 'Gems',
  gemhistory: 'Gem History',
  purchase: 'Buy MeLy Club / Gems',
  devices: 'Logged-in Devices',
  account: 'Manage Account',
  mycharacters: 'Your Characters',
  following: 'Following',
  badges: 'Badges',
  appearance: 'Appearance',
  settings: 'Settings',
  notificationsettings: 'Notification Settings',
  videosettings: 'Video Settings',
  about: 'About Us',
  verifyemail: 'Verify Email',
  username: 'Username',
  deleteaccount: 'Delete Account',
  characterform: 'Create/Edit Character',
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
  about: Info,
  verifyemail: Mail,
  username: AtSign,
  deleteaccount: Trash2,
  characterform: UserPlus,
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
  verifyemail: 'account',
  username: 'account',
  deleteaccount: 'account',
}

export const CHILD_SCREENS: Partial<Record<ScreenId, ScreenId[]>> = {
  chatdetail: ['chatoptions'],
  characterprofile: ['creatorprofile'],
  gems: ['gemhistory', 'purchase'],
  settings: ['notificationsettings', 'videosettings'],
  account: ['verifyemail', 'username', 'deleteaccount'],
}

// Which base page each "primary" overlay (one not already nested under
// another overlay per SCREEN_PARENT) sits under. Profil Karakter, Notifikasi,
// and Gem are all reachable from Beranda's content or its header; Chat
// detail is reachable from Obrolan's thread list.
export const PAGE_CHILDREN: Record<string, ScreenId[]> = {
  feed: ['characterprofile', 'notification', 'gems'],
  chatlist: ['chatdetail'],
  profile: ['devices', 'account', 'mycharacters', 'following', 'badges', 'appearance', 'settings', 'about', 'characterform'],
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
  'about',
  'verifyemail',
  'username',
  'deleteaccount',
  'characterprofile',
  'creatorprofile',
  'notification',
  'gems',
  'gemhistory',
  'purchase',
  'chatdetail',
  'chatoptions',
  'characterform',
]

// Every local popup/menu zone that isn't reachable just by mounting its
// screen — each one lives behind its own button click inside that screen's
// component, so warming up the screen alone (WARM_UP_SCREENS above) never
// registers their strings. The startup pass also broadcasts a requestPopup
// for each of these, briefly opening then closing it, so "All" shows
// every popup/menu's content from the first render instead of only after a
// translator has happened to open each one by hand at least once.
export const WARM_UP_ZONES: Partial<Record<ScreenId, string[]>> = {
  profile: ['menu'],
  account: [
    'verify_menu',
    'identity_card_edit',
    'unlink_blocked',
    'privacy_menu',
    'gender_menu',
    'birthdate_edit',
    'bio_edit',
    'logout_confirm',
  ],
  mycharacters: ['menu', 'delete_confirm'],
  deleteaccount: ['delete_account_confirm'],
  username: ['discard_confirm'],
  characterform: ['gender_menu', 'privacy_menu'],
  gems: ['gem_detail', 'invite_input', 'lucky_wheel', 'lucky_result'],
  chatdetail: ['mode_picker', 'relationship', 'role_summary', 'role_edit'],
  notification: ['menu'],
  purchase: ['club', 'gem'],
  characterprofile: ['menu', 'block_confirm', 'report'],
  creatorprofile: ['menu', 'block_confirm', 'report'],
  chatoptions: ['menu', 'block_confirm', 'report'],
}

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
  'discard_confirm',
  'verify_menu',
  'identity_card_edit',
  'unlink_blocked',
  'privacy_menu',
  'gender_menu',
  'birthdate_edit',
  'bio_edit',
  'logout_confirm',
  'delete_account_confirm',
  'report',
  'mode_picker',
  'relationship',
  'role_summary',
  'role_edit',
  'club',
  'gem',
]
export const ZONE_LABEL: Record<string, string> = {
  page: 'Page',
  menu: 'Options',
  gem_detail: 'Popup: Gem Detail',
  invite_input: 'Popup: Enter Code',
  lucky_wheel: 'Menu: Lucky Wheel',
  lucky_result: 'Popup: Draw Result',
  block_confirm: 'Popup: Block Confirmation',
  delete_confirm: 'Popup: Delete Confirmation',
  discard_confirm: 'Popup: Discard Changes',
  verify_menu: 'Menu: Verify Account',
  identity_card_edit: 'Popup: ID Number',
  unlink_blocked: 'Popup: Cannot Unlink',
  privacy_menu: 'Menu: Privacy Options',
  gender_menu: 'Menu: Gender',
  birthdate_edit: 'Popup: Birthdate',
  bio_edit: 'Popup: Bio',
  logout_confirm: 'Popup: Logout Confirmation',
  delete_account_confirm: 'Popup: Delete Account Confirmation',
  report: 'Menu: Report',
  mode_picker: 'Menu: Chat Mode',
  relationship: 'Popup: Relationship Level',
  role_summary: 'Popup: Change Role',
  role_edit: 'Popup: Edit Role',
  club: 'Tab: MêLy Club',
  gem: 'Tab: Gems',
}

// Classifies each zone by how it actually renders in the real UI — verified
// against every ZoneScope in the codebase by its CSS: a bottom sheet
// (`rounded-t-3xl` + `bottom-0`) is a MENU, a centered dialog (`rounded-2xl`
// + `top-1/2`) is a POPUP. `tab` covers Beli MêLy Club/Gem's sub-tabs, which
// are neither. Drives the Inspector's Menu/Popup grouping within a screen.
export type ZoneKind = 'menu' | 'popup' | 'tab'
export const ZONE_TYPE: Record<string, ZoneKind> = {
  menu: 'menu',
  verify_menu: 'menu',
  privacy_menu: 'menu',
  gender_menu: 'menu',
  mode_picker: 'menu',
  report: 'menu',
  lucky_wheel: 'menu',
  gem_detail: 'popup',
  invite_input: 'popup',
  lucky_result: 'popup',
  block_confirm: 'popup',
  delete_confirm: 'popup',
  discard_confirm: 'popup',
  identity_card_edit: 'popup',
  unlink_blocked: 'popup',
  birthdate_edit: 'popup',
  bio_edit: 'popup',
  logout_confirm: 'popup',
  delete_account_confirm: 'popup',
  relationship: 'popup',
  role_summary: 'popup',
  role_edit: 'popup',
  club: 'tab',
  gem: 'tab',
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
  { id: 'all', label: 'All' },
  { id: 'unwired', label: 'Unwired' },
  { id: 'overridden', label: 'Overridden' },
]
