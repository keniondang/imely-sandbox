import type { SourceLocale } from './strings'

// Every "not implemented yet" stub action in the sandbox shares this exact
// "<action> — <coming soon>" shape (showToast('X — segera hadir')). These
// are synthetic placeholder interactions the sandbox itself invented —
// there's no real xlsx key backing them the way every other string in the
// app has — so unlike everywhere else, there's no sheet content to pull an
// English version from. The wording below is hand-written to match, so the
// toast follows baseLocale like everything else instead of always showing
// Indonesian regardless of which base language a translator has picked.
const SUFFIX: Record<SourceLocale, string> = {
  id: 'segera hadir',
  en: 'coming soon',
  vi: 'sắp ra mắt',
}

const ACTION = {
  takePhoto: { id: 'Ambil foto', en: 'Take photo', vi: 'Chụp ảnh' },
  pickFromGallery: { id: 'Pilih foto dari galeri', en: 'Choose from gallery', vi: 'Chọn ảnh từ thư viện' },
  viewAvatar: { id: 'Lihat avatar', en: 'View avatar', vi: 'Xem ảnh đại diện' },
  share: { id: 'Bagikan', en: 'Share', vi: 'Chia sẻ' },
  tiktok: { id: 'TikTok', en: 'TikTok', vi: 'TikTok' },
  discord: { id: 'Discord', en: 'Discord', vi: 'Discord' },
  avatar: { id: 'Avatar', en: 'Avatar', vi: 'Ảnh đại diện' },
  playVoice: { id: 'Putar suara', en: 'Play voice', vi: 'Phát giọng nói' },
  quickAction: { id: 'Tindakan', en: 'Action', vi: 'Hành động' },
  attachment: { id: 'Lampiran', en: 'Attachment', vi: 'Tệp đính kèm' },
  deleteAndLogout: { id: 'Hapus dan keluar', en: 'Delete and log out', vi: 'Xoá và đăng xuất' },
  changeProfilePhoto: { id: 'Ganti foto profil', en: 'Change profile photo', vi: 'Đổi ảnh đại diện' },
  changeName: { id: 'Ubah nama', en: 'Change name', vi: 'Đổi tên' },
  userId: { id: 'User ID', en: 'User ID', vi: 'User ID' },
  connectFacebook: { id: 'Hubungkan Facebook', en: 'Connect Facebook', vi: 'Liên kết Facebook' },
  logout: { id: 'Keluar', en: 'Log out', vi: 'Đăng xuất' },
  unfollow: { id: 'Berhenti mengikuti', en: 'Unfollow', vi: 'Bỏ theo dõi' },
  viewProfile: { id: 'Lihat profil', en: 'View profile', vi: 'Xem hồ sơ' },
  call: { id: 'Call', en: 'Call', vi: 'Gọi' },
  deleteConversation: { id: 'Hapus percakapan', en: 'Delete conversation', vi: 'Xoá cuộc trò chuyện' },
  internalQaFeature: { id: 'Fitur QA internal', en: 'Internal QA feature', vi: 'Tính năng QA nội bộ' },
  message: { id: 'Pesan', en: 'Message', vi: 'Nhắn tin' },
  characterDeleted: { id: 'Karakter dihapus', en: 'Character deleted', vi: 'Đã xoá nhân vật' },
  sendFeedback: { id: 'Kirim masukan', en: 'Send feedback', vi: 'Gửi phản hồi' },
  termsOfService: { id: 'Ketentuan Layanan', en: 'Terms of Service', vi: 'Điều khoản dịch vụ' },
  privacyPolicy: { id: 'Kebijakan Privasi', en: 'Privacy Policy', vi: 'Chính sách quyền riêng tư' },
  copyrightPolicy: { id: 'Kebijakan Hak Cipta', en: 'Copyright Policy', vi: 'Chính sách bản quyền' },
  buyGem: { id: 'Beli gem', en: 'Buy gems', vi: 'Mua Gem' },
  watchAd: { id: 'Tonton iklan', en: 'Watch ad', vi: 'Xem quảng cáo' },
  dailyReward: { id: 'Hadiah harian', en: 'Daily reward', vi: 'Phần thưởng hằng ngày' },
  scanQrCode: { id: 'Pindai Kode QR', en: 'Scan QR Code', vi: 'Quét mã QR' },
  shareQrCode: { id: 'Bagikan Kode QR', en: 'Share QR Code', vi: 'Chia sẻ mã QR' },
  saveQrImage: { id: 'Simpan gambar QR', en: 'Save QR image', vi: 'Lưu ảnh mã QR' },
  shareProfile: { id: 'Bagikan profil', en: 'Share profile', vi: 'Chia sẻ hồ sơ' },
  copyLink: { id: 'Salin tautan', en: 'Copy link', vi: 'Sao chép liên kết' },
  verificationCodeSent: { id: 'Kode verifikasi dikirim', en: 'Verification code sent', vi: 'Đã gửi mã xác minh' },
} satisfies Record<string, Record<SourceLocale, string>>

export type StubAction = keyof typeof ACTION

export function stubToast(action: StubAction, baseLocale: SourceLocale): string {
  return `${ACTION[action][baseLocale]} — ${SUFFIX[baseLocale]}`
}
