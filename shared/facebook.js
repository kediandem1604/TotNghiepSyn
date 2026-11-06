// Ô "Facebook" ở phần Liên hệ: nhận link trang cá nhân hoặc tên người dùng.
// (Trong content.js và cài đặt, ô này vẫn tên `contact.messenger` để giữ dữ liệu đã lưu.)

const FB_HOST = /^(?:www\.|m\.|web\.|mbasic\.)?(?:facebook\.com|fb\.com)$/i
const USER = /^[A-Za-z0-9.]{1,80}$/
const BASE = 'https://www.facebook.com'

/**
 * Link Facebook / m.me hoặc tên người dùng → link trang cá nhân chuẩn
 * (https://www.facebook.com/...). Trống → ''. Không đọc được → null.
 */
export function normalizeFacebook(input) {
  const value = String(input ?? '').trim()
  if (!value) return ''
  if (USER.test(value) && !value.includes('.com')) return `${BASE}/${value}`

  let url
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }
  if (!/^https?:$/.test(url.protocol)) return null
  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'm.me') return parts[0] && USER.test(parts[0]) ? `${BASE}/${parts[0]}` : null
  if (!FB_HOST.test(host) || !parts.length) return null

  if (parts[0] === 'profile.php') {
    const id = url.searchParams.get('id') || ''
    return /^\d{5,20}$/.test(id) ? `${BASE}/profile.php?id=${id}` : null
  }
  // Link chia sẻ từ app (facebook.com/share/…) và facebook.com/people/Tên/id: giữ nguyên đường dẫn.
  if (parts[0] === 'share' || parts[0] === 'people') {
    return parts.every((p) => /^[\w.-]+$/.test(p)) ? `${BASE}/${parts.join('/')}/` : null
  }
  return USER.test(parts[0]) ? `${BASE}/${parts[0]}` : null
}

/** Nút Facebook trên thiệp: { href, text }; giá trị không dùng được → null. */
export function facebookLink(value) {
  const href = normalizeFacebook(value)
  if (!href) return null
  const path = href.slice(BASE.length + 1)
  return { href, text: USER.test(path) ? path : 'Trang cá nhân' }
}
