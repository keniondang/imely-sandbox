import type { SourceLocale } from '../lib/strings'

// Placeholder UGC — character cards, chat threads, avatars.
// This is NOT real product content, just enough shape to preview layout.
// Swap/extend per Keni's guidance per component.

// Every placeholder field a translator would actually see on screen is
// authored in all 3 source languages (not just one) so it follows the
// Inspector's Base-locale selector like real sheet content does — read it
// with `ph(field, baseLocale)`. Identity/matching fields (ids, colors,
// counts) stay plain since they aren't displayed language.
export type LocalizedText = Record<SourceLocale, string>

export function ph(text: LocalizedText, locale: SourceLocale): string {
  return text[locale]
}

export interface MockCharacter {
  id: string
  name: LocalizedText
  tagline: LocalizedText
  tags: LocalizedText[]
  chatCount: string
  color: string // avatar bg fallback
  // Character profile page fields — draft/placeholder, not xlsx content.
  followers: string
  creatorId: string
  creatorName: LocalizedText
  creatorFollowers: string
  creatorBadgeKey: string
  creatorNote: LocalizedText
  publicInfo: LocalizedText
  biography: LocalizedText
  firstMessage: LocalizedText
}

export const MOCK_FEED_CHARACTERS: MockCharacter[] = [
  {
    id: 'c1',
    name: { id: '[Karakter 1]', en: '[Character 1]', vi: '[Nhân vật 1]' },
    tagline: {
      id: '[Tagline placeholder karakter 1]',
      en: '[Placeholder character tagline 1]',
      vi: '[Khẩu hiệu giữ chỗ của nhân vật 1]',
    },
    tags: [{ id: '[Sifat]', en: '[Trait]', vi: '[Đặc điểm]' }],
    chatCount: '314',
    color: '#FDE68A',
    followers: '24',
    creatorId: 'creator_1',
    creatorName: { id: '[kreator_1]', en: '[creator_1]', vi: '[nguoi_tao_1]' },
    creatorFollowers: '5',
    creatorBadgeKey: 'badge.creator_rookie',
    creatorNote: {
      id: '[Catatan placeholder dari kreator]',
      en: '[Placeholder note from creator]',
      vi: '[Ghi chú giữ chỗ từ người tạo]',
    },
    publicInfo: {
      id: '[Informasi publik placeholder untuk karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder public info for this character, generic filler for layout preview]',
      vi: '[Thông tin công khai giữ chỗ cho nhân vật này, văn bản chung để xem trước bố cục]',
    },
    biography: {
      id: '[Biografi placeholder karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder biography text for this character, generic filler for layout preview]',
      vi: '[Tiểu sử giữ chỗ của nhân vật, văn bản chung để xem trước bố cục]',
    },
    firstMessage: {
      id: '*[aksi placeholder]*\n"[Dialog pembuka placeholder]"',
      en: '*[placeholder action]*\n"[Placeholder opening dialogue]"',
      vi: '*[hành động giữ chỗ]*\n"[Lời thoại mở đầu giữ chỗ]"',
    },
  },
  {
    id: 'c2',
    name: { id: '[Karakter 2]', en: '[Character 2]', vi: '[Nhân vật 2]' },
    tagline: {
      id: '[Tagline placeholder karakter 2]',
      en: '[Placeholder character tagline 2]',
      vi: '[Khẩu hiệu giữ chỗ của nhân vật 2]',
    },
    tags: [
      { id: '[Sifat 1]', en: '[Trait 1]', vi: '[Đặc điểm 1]' },
      { id: '[Sifat 2]', en: '[Trait 2]', vi: '[Đặc điểm 2]' },
    ],
    chatCount: '1.6K',
    color: '#C7D2FE',
    followers: '312',
    creatorId: 'creator_2',
    creatorName: { id: '[kreator_2]', en: '[creator_2]', vi: '[nguoi_tao_2]' },
    creatorFollowers: '47',
    creatorBadgeKey: 'badge.creator_rookie',
    creatorNote: {
      id: '[Catatan placeholder dari kreator]',
      en: '[Placeholder note from creator]',
      vi: '[Ghi chú giữ chỗ từ người tạo]',
    },
    publicInfo: {
      id: '[Informasi publik placeholder untuk karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder public info for this character, generic filler for layout preview]',
      vi: '[Thông tin công khai giữ chỗ cho nhân vật này, văn bản chung để xem trước bố cục]',
    },
    biography: {
      id: '[Biografi placeholder karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder biography text for this character, generic filler for layout preview]',
      vi: '[Tiểu sử giữ chỗ của nhân vật, văn bản chung để xem trước bố cục]',
    },
    firstMessage: {
      id: '*[aksi placeholder]*\n"[Dialog pembuka placeholder]"',
      en: '*[placeholder action]*\n"[Placeholder opening dialogue]"',
      vi: '*[hành động giữ chỗ]*\n"[Lời thoại mở đầu giữ chỗ]"',
    },
  },
  {
    id: 'c3',
    name: { id: '[Karakter 3]', en: '[Character 3]', vi: '[Nhân vật 3]' },
    tagline: {
      id: '[Tagline placeholder karakter 3]',
      en: '[Placeholder character tagline 3]',
      vi: '[Khẩu hiệu giữ chỗ của nhân vật 3]',
    },
    tags: [
      { id: '[Sifat 1]', en: '[Trait 1]', vi: '[Đặc điểm 1]' },
      { id: '[Sifat 2]', en: '[Trait 2]', vi: '[Đặc điểm 2]' },
    ],
    chatCount: '892',
    color: '#FBCFE8',
    followers: '8',
    creatorId: 'creator_3',
    creatorName: { id: '[kreator_3]', en: '[creator_3]', vi: '[nguoi_tao_3]' },
    creatorFollowers: '2',
    creatorBadgeKey: 'badge.creator_rookie',
    creatorNote: {
      id: '[Catatan placeholder dari kreator]',
      en: '[Placeholder note from creator]',
      vi: '[Ghi chú giữ chỗ từ người tạo]',
    },
    publicInfo: {
      id: '[Informasi publik placeholder untuk karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder public info for this character, generic filler for layout preview]',
      vi: '[Thông tin công khai giữ chỗ cho nhân vật này, văn bản chung để xem trước bố cục]',
    },
    biography: {
      id: '[Biografi placeholder karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder biography text for this character, generic filler for layout preview]',
      vi: '[Tiểu sử giữ chỗ của nhân vật, văn bản chung để xem trước bố cục]',
    },
    firstMessage: {
      id: '*[aksi placeholder]*\n"[Dialog pembuka placeholder]"',
      en: '*[placeholder action]*\n"[Placeholder opening dialogue]"',
      vi: '*[hành động giữ chỗ]*\n"[Lời thoại mở đầu giữ chỗ]"',
    },
  },
  {
    id: 'c4',
    name: { id: '[Karakter 4]', en: '[Character 4]', vi: '[Nhân vật 4]' },
    tagline: {
      id: '[Tagline placeholder karakter 4]',
      en: '[Placeholder character tagline 4]',
      vi: '[Khẩu hiệu giữ chỗ của nhân vật 4]',
    },
    tags: [{ id: '[Sifat]', en: '[Trait]', vi: '[Đặc điểm]' }],
    chatCount: '2.1K',
    color: '#BBF7D0',
    followers: '156',
    creatorId: 'creator_4',
    creatorName: { id: '[kreator_4]', en: '[creator_4]', vi: '[nguoi_tao_4]' },
    creatorFollowers: '19',
    creatorBadgeKey: 'badge.creator_rookie',
    creatorNote: {
      id: '[Catatan placeholder dari kreator]',
      en: '[Placeholder note from creator]',
      vi: '[Ghi chú giữ chỗ từ người tạo]',
    },
    publicInfo: {
      id: '[Informasi publik placeholder untuk karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder public info for this character, generic filler for layout preview]',
      vi: '[Thông tin công khai giữ chỗ cho nhân vật này, văn bản chung để xem trước bố cục]',
    },
    biography: {
      id: '[Biografi placeholder karakter ini, teks generik untuk pratinjau tata letak]',
      en: '[Placeholder biography text for this character, generic filler for layout preview]',
      vi: '[Tiểu sử giữ chỗ của nhân vật, văn bản chung để xem trước bố cục]',
    },
    firstMessage: {
      id: '*[aksi placeholder]*\n"[Dialog pembuka placeholder]"',
      en: '*[placeholder action]*\n"[Placeholder opening dialogue]"',
      vi: '*[hành động giữ chỗ]*\n"[Lời thoại mở đầu giữ chỗ]"',
    },
  },
]

export interface MockChatThread {
  id: string
  name: LocalizedText
  preview: LocalizedText
  date: string
  unread?: number
  color: string
  isSticker?: boolean
}

export const MOCK_CHAT_THREADS: MockChatThread[] = [
  {
    id: 't1',
    name: { id: '[Kontak 1]', en: '[Contact 1]', vi: '[Liên hệ 1]' },
    preview: { id: '[Stiker]', en: '[Sticker]', vi: '[Nhãn dán]' },
    date: '07/08/2026',
    color: '#111827',
    isSticker: true,
  },
  {
    id: 't2',
    name: { id: '[Kontak 2]', en: '[Contact 2]', vi: '[Liên hệ 2]' },
    preview: { id: '[Stiker]', en: '[Sticker]', vi: '[Nhãn dán]' },
    date: '06/08/2026',
    color: '#93C5FD',
    isSticker: true,
  },
  {
    id: 't3',
    name: { id: '[Kontak 3]', en: '[Contact 3]', vi: '[Liên hệ 3]' },
    preview: { id: '[Pesan placeholder]', en: '[Placeholder message]', vi: '[Tin nhắn giữ chỗ]' },
    date: '05/08/2026',
    color: '#1F2937',
  },
  {
    id: 't4',
    name: { id: '[Kontak 4]', en: '[Contact 4]', vi: '[Liên hệ 4]' },
    preview: {
      id: '[Pratinjau pesan placeholder, cukup panjang untuk menguji perilaku pembungkusan teks pada tata letak ini]',
      en: '[Placeholder message preview, long enough to test text wrapping behavior in this layout]',
      vi: '[Xem trước tin nhắn giữ chỗ, đủ dài để kiểm tra hành vi ngắt dòng văn bản trong bố cục này]',
    },
    date: '04/08/2026',
    color: '#D6D3D1',
  },
  {
    id: 't5',
    name: { id: '[Kontak 5]', en: '[Contact 5]', vi: '[Liên hệ 5]' },
    preview: { id: '[Pesan sistem placeholder]', en: '[Placeholder system message]', vi: '[Tin nhắn hệ thống giữ chỗ]' },
    date: '03/08/2026',
    unread: 1,
    color: '#334155',
  },
  {
    id: 't6',
    name: { id: '[Kontak 6]', en: '[Contact 6]', vi: '[Liên hệ 6]' },
    preview: { id: '[Pesan placeholder]', en: '[Placeholder message]', vi: '[Tin nhắn giữ chỗ]' },
    date: '03/08/2026',
    color: '#FBCFE8',
  },
]

export const MOCK_USER = {
  name: { id: '[Nama Pengguna]', en: '[Username]', vi: '[Tên người dùng]' } as LocalizedText,
  // Handles stay as a single technical-identifier-style placeholder rather
  // than translating per locale — same reasoning as a real @handle never
  // changing translation.
  handle: '[user_handle]',
  gems: 2250,
  permanentGems: 4,
  dailyGems: 2246,
  tierBadgeKey: 'badge.creator_rookie',
  avatarColor: '#111827',
  // Kelola akun page fields — draft/placeholder, not xlsx content.
  loginProvider: 'Google',
  birthdate: '01/04/1990',
}

// Placeholder — not in the xlsx (referral program is a real feature, but the
// code itself is per-user generated data).
export const MOCK_INVITE_CODE = '3337762727'

export interface MockDevice {
  id: string
  name: string
  current?: boolean
  loginDate: string
  loginTime: string
  city: string
}

// Placeholder — session/device metadata is backend-generated per login, not
// xlsx content (the surrounding row/dialog copy still comes from the
// "Active Session" category, see DevicesScreen).
export const MOCK_DEVICES: MockDevice[] = [
  { id: 'd1', name: 'Samsung Galaxy S21 Ultra 5G', current: true, loginDate: '21/07/2026', loginTime: '16:19', city: 'Thành phố Hồ Chí Minh' },
  { id: 'd2', name: 'Asus ROG Phone 8 series', loginDate: '22/07/2026', loginTime: '14:37', city: 'Thành phố Hồ Chí Minh' },
  { id: 'd3', name: 'iPhone 14 Pro Max', loginDate: '11/07/2026', loginTime: '09:11', city: 'Thành phố Hồ Chí Minh' },
]

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

export interface MockClubPlan {
  id: 'monthly' | 'yearly'
  labelKey: string
  price: string
  oldPrice: string
  discountPct: number
}

// Placeholder — IAP catalog (prices, discounts) is store config, not xlsx
// content. Plan-name labels ARE real strings, keyed by labelKey.
export const MOCK_CLUB_PLANS: MockClubPlan[] = [
  { id: 'monthly', labelKey: 'product_purchase.subs_monthly', price: 'Rp299.000', oldPrice: 'Rp499.000', discountPct: 40 },
  { id: 'yearly', labelKey: 'product_purchase.subs_yearly', price: 'Rp2.399.000', oldPrice: 'Rp5.988.000', discountPct: 60 },
]

export interface MockGemPack {
  id: string
  amount: number
  price: string
}

// Placeholder — IAP gem-pack catalog, not xlsx content.
export const MOCK_GEM_PACKS: MockGemPack[] = [
  { id: 'g1', amount: 300, price: 'Rp29.000' },
  { id: 'g2', amount: 600, price: 'Rp59.000' },
  { id: 'g3', amount: 1500, price: 'Rp119.000' },
  { id: 'g4', amount: 3500, price: 'Rp249.000' },
  { id: 'g5', amount: 8000, price: 'Rp499.000' },
  { id: 'g6', amount: 15000, price: 'Rp799.000' },
]

export interface MockGemActivity {
  id: string
  description: string
  receivedDate: string
  expiry: string
  change: string
  expired: boolean
}

// Placeholder — per-user transaction log, not xlsx content. Column headers
// and tab labels ARE real strings — see gem_history.* in GemHistoryScreen.tsx.
export const MOCK_GEM_ACTIVITY: MockGemActivity[] = [
  { id: 'a1', description: 'Kamu menerima 5💎 setelah menonton iklan sampai selesai', receivedDate: '12/08/2026', expiry: '31/12/2026', change: '+5', expired: false },
  { id: 'a2', description: 'imely memberi kamu 100💎', receivedDate: '12/08/2026', expiry: '12/08/2026', change: '+100', expired: false },
  { id: 'a3', description: 'Kamu memenangkan 18💎 dari putaran', receivedDate: '11/08/2026', expiry: '31/12/2026', change: '+18', expired: false },
  { id: 'a4', description: 'imely memberi kamu 100💎', receivedDate: '11/08/2026', expiry: 'Kedaluwarsa', change: '+100', expired: true },
  { id: 'a5', description: 'imely memberi kamu 100💎', receivedDate: '10/08/2026', expiry: 'Kedaluwarsa', change: '+100', expired: true },
  { id: 'a6', description: 'imely memberi kamu 100💎', receivedDate: '07/08/2026', expiry: 'Kedaluwarsa', change: '+100', expired: true },
  { id: 'a7', description: 'Kamu menerima hadiah senilai 150💎', receivedDate: '31/07/2026', expiry: '31/12/2026', change: '+150', expired: false },
  { id: 'a8', description: 'Kamu menerima hadiah senilai 1500💎', receivedDate: '28/07/2026', expiry: '31/12/2026', change: '+1500', expired: false },
]

export interface MockGemUsage {
  id: string
  content: string
  date: string
  feature: string | null
  amount: string
  expired: boolean
}

// Placeholder — reuses MOCK_CHAT_THREADS names for the "chat" rows so this
// stays consistent with the rest of the sandbox rather than inventing new ones.
export const MOCK_GEM_USAGE: MockGemUsage[] = [
  { id: 'u1', content: `Mengobrol dengan ${MOCK_CHAT_THREADS[0].name.id}`, date: '12/08/2026', feature: 'Chat', amount: '-5', expired: false },
  { id: 'u2', content: 'Penarikan Gem kedaluwarsa', date: '11/08/2026', feature: null, amount: '-100', expired: true },
  { id: 'u3', content: 'Penarikan Gem kedaluwarsa', date: '10/08/2026', feature: null, amount: '-100', expired: true },
  { id: 'u4', content: `Mengobrol dengan ${MOCK_CHAT_THREADS[1].name.id}`, date: '06/08/2026', feature: 'Chat', amount: '-5', expired: false },
  { id: 'u5', content: 'Penarikan Gem kedaluwarsa', date: '05/08/2026', feature: null, amount: '-95', expired: true },
  { id: 'u6', content: `Mengobrol dengan ${MOCK_CHAT_THREADS[3].name.id}`, date: '04/08/2026', feature: 'Chat', amount: '-15', expired: false },
  { id: 'u7', content: `Mengobrol dengan ${MOCK_CHAT_THREADS[5].name.id}`, date: '03/08/2026', feature: 'Chat', amount: '-5', expired: false },
  { id: 'u8', content: 'Penarikan Gem kedaluwarsa', date: '02/08/2026', feature: null, amount: '-100', expired: true },
]

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
