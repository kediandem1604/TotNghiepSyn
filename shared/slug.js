import { RESERVED_SLUGS } from './constants.js'

const MAX_LEN = 40

/** Bỏ dấu tiếng Việt (kể cả đ/Đ), giữ nguyên chữ hoa/thường. */
export function stripDiacritics(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/** "Tiến Quốc" → "tien-quoc". Có thể trả chuỗi rỗng. */
export function toSlug(text) {
  return stripDiacritics(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_LEN)
    .replace(/-+$/g, '')
}

function random4() {
  return Math.random().toString(36).slice(2, 6).padEnd(4, '0')
}

/** Slug chưa ai dùng; trùng thì thêm -2, -3… */
export function uniqueSlug(name, taken, rand = random4) {
  const isTaken = (s) => taken.has(s) || RESERVED_SLUGS.includes(s)
  let base = toSlug(name)
  if (!base) {
    let s
    do s = `khach-${rand()}`
    while (isTaken(s))
    return s
  }
  if (!isTaken(base)) return base
  for (let n = 2; ; n++) {
    const suffix = `-${n}`
    const s = base.slice(0, MAX_LEN - suffix.length).replace(/-+$/g, '') + suffix
    if (!isTaken(s)) return s
  }
}
