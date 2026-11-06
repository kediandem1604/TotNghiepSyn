// Hằng số dùng chung cho trang thiệp và máy chủ.

export const REACTIONS = [
  { key: 'tim', emoji: '❤️', label: 'Thả tim' },
  { key: 'phao', emoji: '🎉', label: 'Pháo hoa' },
  { key: 'votay', emoji: '👏', label: 'Vỗ tay' },
  { key: 'xucdong', emoji: '🥹', label: 'Xúc động' },
  { key: 'mu', emoji: '🎓', label: 'Mũ tốt nghiệp' },
  { key: 'hoa', emoji: '💐', label: 'Tặng hoa' },
]

export const REACTION_KEYS = REACTIONS.map((r) => r.key)

// Emoji đi kèm lời chúc. Phần tử đầu là mặc định.
export const WISH_EMOJIS = ['🎓', '❤️', '🎉', '🥹', '👏', '💐']

export const LIMITS = {
  guestName: 60,
  title: 20,
  note: 300,
  wishName: 40,
  wishMessage: 500,
  maxBody: 20 * 1024,
  maxWishes: 1000,
  reactionPerRequest: 60,
  bulkMax: 200,
}

// Đường dẫn không được dùng làm link khách.
export const RESERVED_SLUGS = ['quan-li', 'api', 'assets', 'nhac', 'anh']
