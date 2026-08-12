// Placeholder UGC — character cards, chat threads, avatars.
// This is NOT real product content, just enough shape to preview layout.
// Swap/extend per Keni's guidance per component.

export interface MockCharacter {
  id: string
  name: string
  tagline: string
  tags: string[]
  chatCount: string
  color: string // avatar bg fallback
}

export const MOCK_FEED_CHARACTERS: MockCharacter[] = [
  { id: 'c1', name: 'Kael', tagline: 'coba rebut bola nya dari aku kalau bisa!!', tags: ['ngeselin!'], chatCount: '314', color: '#FDE68A' },
  { id: 'c2', name: 'Reygan', tagline: '"pacaran biasa aja tpii serasa pacaran sama ank kecil"', tags: ['Clingy', 'Posesif'], chatCount: '1.6K', color: '#C7D2FE' },
  { id: 'c3', name: 'Arka', tagline: 'diam itu bukan berarti aku gak peduli.', tags: ['Dingin', 'Protektif'], chatCount: '892', color: '#FBCFE8' },
  { id: 'c4', name: 'Bima', tagline: 'kamu telat lagi. aku nunggu dari tadi.', tags: ['Posesif'], chatCount: '2.1K', color: '#BBF7D0' },
]

export interface MockChatThread {
  id: string
  name: string
  preview: string
  date: string
  unread?: number
  color: string
  isSticker?: boolean
}

export const MOCK_CHAT_THREADS: MockChatThread[] = [
  { id: 't1', name: 'andre wijaya', preview: '[Stiker]', date: '07/08/2026', color: '#111827', isSticker: true },
  { id: 't2', name: 'Zhang chi', preview: '[Stiker]', date: '06/08/2026', color: '#93C5FD', isSticker: true },
  { id: 't3', name: 'Shin kagenou', preview: 'Halo', date: '05/08/2026', color: '#1F2937' },
  { id: 't4', name: 'Lâm Thanh Vũ', preview: 'I tilt my head slightly, a hint of a smile playing on my lips. "You\'re here, in my li...', date: '04/08/2026', color: '#D6D3D1' },
  { id: 't5', name: 'Riko (Teman Rasa Pacar)', preview: '🎉 Character arc complete!! Your char just got a major glow up—go slay!', date: '03/08/2026', unread: 1, color: '#334155' },
  { id: 't6', name: 'Khánh Linh', preview: '"Chào bạn..."', date: '03/08/2026', color: '#FBCFE8' },
]

export const MOCK_USER = {
  name: 'Markus sahabatmu',
  handle: '@52UNcG (internal)',
  gems: 2250,
  permanentGems: 4,
  dailyGems: 2246,
  tierBadgeKey: 'badge.creator_rookie',
  avatarColor: '#111827',
}

// Placeholder — not in the xlsx (referral program is a real feature, but the
// code itself is per-user generated data).
export const MOCK_INVITE_CODE = '3337762727'

export interface MockGemMission {
  id: string
  reward: string
  done: boolean
  progress: string
}

// Placeholder — mission progress/limits are per-user runtime state, not xlsx content.
// Names/subtitles are composed from real user_task.* / user_gem_overview.* strings in GemScreen.
export const MOCK_GEM_MISSIONS: MockGemMission[] = [
  { id: 'watch_ads', reward: '+5', done: false, progress: '0/20' },
  { id: 'lucky_wheel', reward: '+ 0-200', done: false, progress: '0/1' },
  { id: 'daily_gift', reward: '+100', done: true, progress: '1/1' },
]

// Placeholder — not in the xlsx (character/story genre taxonomy, guided later).
// Same list drives both the feed's tag row and the Filter modal's category grid.
export const FILTER_CATEGORIES = [
  'Drama Kolosal',
  'Kehidupan Sekolah',
  'Sistem',
  'Acara Permainan',
  'Gelap',
  'Sulit Ditaklukkan',
  'Lintas Dunia',
  'Mafia',
  'Penyembuhan',
  'Posesif',
  'Anime',
  'BG',
  'BL',
  'GL',
  'Internal',
]

// Placeholder — gender preference filter, single-select.
export const GENDER_OPTIONS = ['All', 'Pria', 'Wanita', 'Non-biner']

export interface MockNotification {
  id: string
  text: string
  time: string
  read: boolean
}

// Placeholder — notification bodies are templated/dynamic in the real app,
// not present in the xlsx. Chrome around them (title, "Semua", Opsi menu)
// uses real strings — see NotificationScreen.tsx.
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'n1', text: 'Lebih dari 114200 orang lagi ngobrol hari ini 🔥Kalo kamu gimana? 👀', time: '21 jam', read: false },
  { id: 'n2', text: 'Lebih dari 148100 orang lagi ngobrol hari ini 🔥Kalo kamu gimana? 👀', time: '03/08/2026', read: false },
  { id: 'n3', text: 'Xem Nhân Vật & Creator bạn đã theo dõi ở tab Cá Nhân 💚', time: '28/07/2026', read: false },
  { id: 'n4', text: 'Makin banyak yang ngobrol sama char kamu, makin banyak 💎 yang kamu dapet!', time: '24/07/2026', read: false },
  { id: 'n5', text: 'Total 5000 💎 udah cair ke para creator, kapan giliran kamu?', time: '17/07/2026', read: false },
  { id: 'n6', text: 'Lebih dari 78500 orang lagi ngobrol hari ini 🔥Kalo kamu gimana? 👀', time: '16/07/2026', read: false },
  { id: 'n7', text: 'Lebih dari 78500 orang lagi ngobrol hari ini 🔥Kalo kamu gimana? 👀', time: '15/07/2026', read: false },
  { id: 'n8', text: 'Lebih dari 78500 orang lagi ngobrol hari ini 🔥Kalo kamu gimana? 👀', time: '14/07/2026', read: false },
]
