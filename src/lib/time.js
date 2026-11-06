// Mọi phép tính ngày giờ ở đây theo giờ Việt Nam (UTC+7),
// không phụ thuộc múi giờ của máy người xem.

const VN_OFFSET_MS = 7 * 3600 * 1000
const DAY = 86400000

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

const pad = (n) => String(n).padStart(2, '0')

/** Đổi instant sang "đồng hồ Việt Nam" để đọc bằng getUTC*. */
function vn(date) {
  return new Date(date.getTime() + VN_OFFSET_MS)
}

function vnDate(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - VN_OFFSET_MS)
}

export function eventRange(event) {
  return { start: vnDate(event.date, event.start), end: vnDate(event.date, event.end) }
}

export function eventPhase(now, range) {
  if (now < range.start) return 'before'
  if (now < range.end) return 'during'
  return 'after'
}

export function countdown(now, start) {
  const diff = Math.max(0, start.getTime() - now.getTime())
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

/** Lưới lịch tháng, mỗi hàng 7 ô từ thứ Hai đến Chủ Nhật. */
export function monthGrid(year, month) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells = Array((firstDow + 6) % 7).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

export function weekdayVi(date) {
  return WEEKDAYS[vn(date).getUTCDay()]
}

/** "10:00" → "10:00 sáng" (trước 11h sáng, trước 13h trưa, trước 18h chiều, còn lại tối). */
export function timeOfDay(hhmm) {
  const hh = Number(hhmm.split(':')[0])
  const part = hh < 11 ? 'sáng' : hh < 13 ? 'trưa' : hh < 18 ? 'chiều' : 'tối'
  return `${hhmm} ${part}`
}

/** "Thứ Năm, 26/11/2026" */
export function longDateVi(date) {
  const v = vn(date)
  return `${weekdayVi(date)}, ${pad(v.getUTCDate())}/${pad(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`
}

export function formatDateDots(date) {
  const v = vn(date)
  return `${pad(v.getUTCDate())}.${pad(v.getUTCMonth() + 1)}.${v.getUTCFullYear()}`
}

export function formatWishTime(iso) {
  const v = vn(new Date(iso))
  return `${pad(v.getUTCDate())}-${pad(v.getUTCMonth() + 1)} ${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`
}

const calStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function googleCalendarUrl({ title, details, location, start, end }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${calStamp(start)}/${calStamp(end)}`,
    details: details || '',
    location: location || '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const icsEscape = (s) =>
  String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

/** Gấp dòng .ics dài quá 75 byte (chuẩn RFC 5545). */
function fold(line) {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const parts = []
  let cur = ''
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (parts.length ? 74 : 75)) {
      parts.push(cur)
      cur = ''
    }
    cur += ch
  }
  parts.push(cur)
  return parts.join('\r\n ')
}

export function buildIcs({ title, details, location, start, end, uid }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ThiepTotNghiep//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${calStamp(new Date())}`,
    `DTSTART:${calStamp(start)}`,
    `DTEND:${calStamp(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(location)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(title)}`,
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
