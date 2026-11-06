import { eventRange, longDateVi, timeOfDay } from './time.js'

/** Tiêu đề tab trình duyệt, theo tên trong cài đặt. */
export const pageTitle = (content) => `Thư mời tốt nghiệp · ${content.graduate.fullName}`

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Dùng khi buộc phải ghép chữ người dùng nhập vào HTML/SVG. */
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])

/** Tin nhắn gửi khách: điền {ten}, {link}, {ngay}, {gio} theo thông tin buổi lễ. */
export function inviteMessage({ template, name, link, event }) {
  return fillTemplate(template, {
    ten: name,
    link,
    ngay: longDateVi(eventRange(event).start),
    gio: timeOfDay(event.start),
  })
}

/** Thay {ten}, {link}… trong mẫu; khoá không có thì giữ nguyên. */
export function fillTemplate(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m))
}

/** Tên khách đúng như đã nhập (không thêm xưng hô); "bạn" khi không có khách. */
export function displayName(guest) {
  return guest?.name || 'bạn'
}
