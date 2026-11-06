import { HttpError } from './http.js'

// Ký tự điều khiển (trừ xuống dòng / tab khi cho phép nhiều dòng)
const CONTROL_ALL = /[\u0000-\u001F\u007F]/g
const CONTROL_KEEP_NL = /[\u0000-\u0008\u000B-\u001F\u007F]/g

/**
 * Làm sạch chữ người dùng nhập và kiểm tra độ dài.
 * Không bỏ thẻ HTML: trang luôn hiển thị bằng textContent nên an toàn.
 */
export function cleanText(value, { label, min = 0, max, multiline = false }) {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string' && typeof value !== 'number') throw new HttpError(400, `${label} không hợp lệ`)
  let s = String(value).normalize('NFC')
  if (multiline) {
    s = s
      .replace(/\r\n?/g, '\n')
      .replace(/\t/g, ' ')
      .replace(CONTROL_KEEP_NL, '')
      .replace(/[ ]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
  } else {
    s = s.replace(/[\t\r\n]/g, ' ').replace(CONTROL_ALL, '').replace(/\s+/g, ' ')
  }
  s = s.trim()
  if (s.length < min) throw new HttpError(400, `Bạn chưa nhập ${label.toLowerCase()}`)
  if (s.length > max) throw new HttpError(400, `${label} tối đa ${max} ký tự`)
  return s
}
