import { toast } from '../lib/dom.js'
import { displayName, inviteMessage } from '../lib/text.js'

export const guestLink = (slug) => `${window.location.origin}/${slug}`

/** Link để người gửi tự mở xem — không tính là khách đã mở thiệp. */
export const previewLink = (slug) => `/${slug}?xem-thu=1`

/** Tin nhắn mời theo mẫu trong cài đặt (`content` là nội dung đã ghép cài đặt). */
export const inviteText = (guest, content) =>
  inviteMessage({
    template: content.texts.shareTemplate,
    name: displayName(guest),
    link: guestLink(guest.slug),
    event: content.event,
  })

export async function copyText(text, okMessage = 'Đã copy') {
  try {
    await navigator.clipboard.writeText(text)
    toast(okMessage, 'success')
  } catch {
    // Trình duyệt không cho copy tự động: hiện hộp để người dùng tự copy.
    window.prompt('Bấm giữ / Ctrl+C để copy:', text)
  }
}

export const canShare = () => typeof navigator.share === 'function'

export async function shareInvite(guest, content) {
  const text = inviteText(guest, content)
  try {
    await navigator.share({ title: 'Thư mời tốt nghiệp', text })
  } catch (err) {
    if (err?.name !== 'AbortError') copyText(text, 'Đã copy lời mời')
  }
}
