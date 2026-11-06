const HOSTS = /^(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com)$/
const ID = /^[A-Za-z0-9_-]{11}$/

/** "42", "42s", "1m30s", "1h2s" → số giây; không đọc được thì 0. */
function seconds(value) {
  if (!value) return 0
  if (/^\d+$/.test(value)) return Number(value)
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m) return 0
  const [, h = 0, min = 0, s = 0] = m
  return Number(h) * 3600 + Number(min) * 60 + Number(s)
}

/**
 * Đọc link YouTube (watch, youtu.be, shorts, embed, music.youtube…) → { id, start }.
 * Bỏ qua danh sách phát/radio đi kèm; không nhận ra thì null.
 */
export function youtubeInfo(url) {
  if (typeof url !== 'string' || !url.trim()) return null
  let u
  try {
    const raw = url.trim()
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  const host = u.hostname.toLowerCase()
  let id = null
  if (host === 'youtu.be') id = u.pathname.split('/')[1]
  else if (HOSTS.test(host)) {
    const [, first, second] = u.pathname.split('/')
    id = first === 'watch' ? u.searchParams.get('v') : ['shorts', 'embed', 'live'].includes(first) ? second : null
  }
  if (!id || !ID.test(id)) return null
  return { id, start: seconds(u.searchParams.get('t') || u.searchParams.get('start')) }
}
