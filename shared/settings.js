// Các ô thông tin thiệp sửa được trong tab "Cài đặt" của trang quản lí.
// Dùng chung cho thiệp, trang quản lí và máy chủ (kiểm tra khi lưu).
// path = vị trí của ô trong content.js.

export const SETTINGS_GROUPS = [
  {
    title: 'Thời gian',
    fields: [
      { path: 'event.date', label: 'Ngày', kind: 'date', required: true },
      { path: 'event.start', label: 'Giờ bắt đầu', kind: 'time', required: true },
      { path: 'event.end', label: 'Giờ kết thúc', kind: 'time', required: true },
      { path: 'event.note', label: 'Ghi chú', kind: 'multiline', max: 300 },
    ],
  },
  {
    title: 'Địa điểm',
    fields: [
      { path: 'venue.name', label: 'Tên nơi tổ chức', kind: 'text', max: 150 },
      { path: 'venue.address', label: 'Địa chỉ', kind: 'text', max: 200 },
      { path: 'venue.mapQuery', label: 'Chữ tìm trên bản đồ', kind: 'text', max: 300, hint: 'Để trống thì ẩn bản đồ.' },
      { path: 'venue.directionsUrl', label: 'Link chỉ đường', kind: 'url', max: 500 },
    ],
  },
  {
    title: 'Tên & lời văn',
    fields: [
      { path: 'graduate.fullName', label: 'Tên hiển thị', kind: 'text', required: true, max: 60 },
      { path: 'graduate.shortName', label: 'Tên gọi ngắn', kind: 'text', required: true, max: 30 },
      { path: 'texts.heroQuote', label: 'Câu dưới tên', kind: 'text', max: 200 },
      { path: 'texts.inviteLead', label: 'Lời mời — mở đầu', kind: 'text', max: 40 },
      { path: 'texts.inviteBody', label: 'Lời mời — nội dung', kind: 'multiline', max: 1000 },
      { path: 'texts.closing', label: 'Lời kết', kind: 'multiline', max: 1000 },
      {
        path: 'texts.shareTemplate',
        label: 'Mẫu tin nhắn gửi khách',
        kind: 'multiline',
        required: true,
        max: 600,
        hint: 'Dùng {ten}, {link}, {ngay}, {gio} để tự điền tên khách, link thiệp, ngày và giờ.',
      },
    ],
  },
  {
    title: 'Nhạc & liên hệ',
    fields: [
      { path: 'music.youtube', label: 'Link YouTube', kind: 'youtube', max: 500, hint: 'Phát trọn bài từ đầu. Được ưu tiên hơn Spotify.' },
      { path: 'music.spotify', label: 'Link Spotify', kind: 'spotify', max: 500, hint: 'Chỉ dùng khi ô Link YouTube để trống.' },
      { path: 'music.title', label: 'Tên bài hát', kind: 'text', max: 100 },
      { path: 'contact.phone', label: 'Điện thoại', kind: 'phone' },
      { path: 'contact.zalo', label: 'Zalo', kind: 'phone', hint: 'Số điện thoại dùng Zalo.' },
      // Ô Facebook; vẫn lưu ở `contact.messenger` để giữ dữ liệu đã lưu trước đây.
      { path: 'contact.messenger', label: 'Facebook', kind: 'facebook', max: 300, hint: 'Dán link trang cá nhân Facebook (vd. https://www.facebook.com/l.nth.03105) hoặc tên người dùng.' },
    ],
  },
]

export const SETTINGS_FIELDS = SETTINGS_GROUPS.flatMap((g) => g.fields)

export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

export function setPath(obj, path, value) {
  const keys = path.split('.')
  const last = keys.pop()
  let o = obj
  for (const k of keys) {
    if (typeof o[k] !== 'object' || o[k] === null) o[k] = {}
    o = o[k]
  }
  o[last] = value
}

/** Lấy các ô sửa được từ nội dung thiệp (ô thiếu → ''). */
export function pickSettings(content) {
  const out = {}
  for (const { path } of SETTINGS_FIELDS) {
    const v = getPath(content, path)
    setPath(out, path, typeof v === 'string' ? v : '')
  }
  return out
}

/**
 * Ghép cài đặt đã lưu vào nội dung gốc: ô nào là chuỗi (kể cả '') thì dùng,
 * còn lại giữ nội dung gốc. Không đổi `content`.
 */
export function mergeSettings(content, settings) {
  const out = structuredClone(content)
  for (const { path } of SETTINGS_FIELDS) {
    const v = getPath(settings, path)
    if (typeof v === 'string') setPath(out, path, v)
  }
  return out
}
