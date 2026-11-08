/**
 * Link nhúng Google Maps cho chữ tìm kiếm `query`.
 *
 * Không dùng google.com/maps?q=…&output=embed: link đó chuyển hướng (301) kèm
 * "X-Frame-Options: SAMEORIGIN", và một số trình duyệt Android (vd. trong Zalo) chặn
 * luôn với lỗi ERR_BLOCKED_BY_RESPONSE. Ở đây tạo thẳng link đích mà Google chuyển tới:
 * /maps/embed?pb=!1m2!2m1!1z + chữ tìm kiếm mã hoá base64 (dạng an toàn cho link, bỏ "=").
 */
export function mapEmbedUrl(query) {
  let binary = ''
  for (const byte of new TextEncoder().encode(query)) binary += String.fromCharCode(byte)
  const code = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1z${code}`
}
