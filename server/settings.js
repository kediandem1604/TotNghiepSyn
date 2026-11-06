import { HttpError } from './http.js'
import { cleanText } from './validate.js'
import { SETTINGS_FIELDS, getPath, setPath, pickSettings } from '../shared/settings.js'
import { youtubeInfo } from '../src/lib/youtube.js'
import { spotifyInfo } from '../src/lib/spotify.js'
import { normalizeFacebook } from '../shared/facebook.js'
import content from '../content.js'

const DEFAULTS = pickSettings(content)

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const URL_RE = /^https?:\/\/\S+$/i
const PHONE = /^\+?[\d .]+$/

const bad = (message) => new HttpError(400, message)

function isRealDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

function checkField(field, raw) {
  const { label, kind, required = false, max = 500 } = field
  const value = cleanText(raw, { label, min: required ? 1 : 0, max, multiline: kind === 'multiline' })
  if (kind === 'date' && !(DATE.test(value) && isRealDate(value))) throw bad('Ngày không hợp lệ')
  if (kind === 'time' && !TIME.test(value)) throw bad(`${label} không hợp lệ`)
  if (!value) return value
  if (kind === 'url' && !URL_RE.test(value)) throw bad(`${label} phải bắt đầu bằng http:// hoặc https://`)
  if (kind === 'youtube' && !youtubeInfo(value)) throw bad('Link YouTube không đúng')
  if (kind === 'spotify' && !spotifyInfo(value)) throw bad('Link Spotify không đúng')
  if (kind === 'facebook') {
    const link = normalizeFacebook(value)
    if (!link) throw bad('Facebook: dán link trang cá nhân hoặc tên người dùng, vd. facebook.com/l.nth.03105')
    return link
  }
  if (kind === 'phone') {
    const digits = value.replace(/\D/g, '').length
    if (!PHONE.test(value) || digits < 8 || digits > 15) throw bad(`${label} không hợp lệ (8–15 chữ số)`)
  }
  return value
}

/**
 * Kiểm tra và làm sạch cài đặt gửi lên; sai thì ném HttpError(400) với câu báo lỗi tiếng Việt.
 * Ô không gửi lên (vd. tab quản lí mở từ bản cũ, chưa có ô mới) thì không lưu → thiệp dùng mặc định.
 */
export function validateSettings(input, defaults = DEFAULTS) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw bad('Cài đặt không hợp lệ')
  const out = {}
  for (const field of SETTINGS_FIELDS) {
    const raw = getPath(input, field.path)
    if (raw !== undefined) setPath(out, field.path, checkField(field, raw))
  }
  // So giữa các ô dùng giá trị sẽ hiện trên thiệp: ô không gửi lên lấy mặc định.
  const shown = (path) => getPath(out, path) ?? getPath(defaults, path)
  if (shown('event.end') <= shown('event.start')) throw bad('Giờ kết thúc phải sau giờ bắt đầu')
  if (!shown('texts.shareTemplate').includes('{link}')) throw bad('Mẫu tin nhắn phải có {link} để khách nhận được link thiệp')
  return out
}
