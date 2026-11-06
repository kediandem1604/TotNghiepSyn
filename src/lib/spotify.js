const TYPES = 'track|album|playlist|episode|show'
const WEB = new RegExp(`^https?://open\\.spotify\\.com/(?:intl-[a-z-]+/)?(?:embed/)?(${TYPES})/([A-Za-z0-9]+)`)
const URI = new RegExp(`^spotify:(${TYPES}):([A-Za-z0-9]+)$`)

/** Đọc link Spotify (link chia sẻ, intl-vi, spotify:…) → thông tin nhúng; không nhận ra thì null. */
export function spotifyInfo(url) {
  if (typeof url !== 'string') return null
  const m = url.trim().match(WEB) || url.trim().match(URI)
  if (!m) return null
  const [, type, id] = m
  return { type, id, uri: `spotify:${type}:${id}`, embedUrl: `https://open.spotify.com/embed/${type}/${id}` }
}
