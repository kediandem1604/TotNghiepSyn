import content from '../../content.js'
import { toast } from '../lib/dom.js'
import { displayName, fillTemplate } from '../lib/text.js'

export const guestLink = (slug) => `${window.location.origin}/${slug}`

/** Link để người gửi tự mở xem — không tính là khách đã mở thiệp. */
export const previewLink = (slug) => `/${slug}?xem-thu=1`

export const inviteText = (guest) =>
  fillTemplate(content.texts.shareTemplate, { ten: displayName(guest), link: guestLink(guest.slug) })

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

export async function shareInvite(guest) {
  try {
    await navigator.share({ title: 'Thư mời tốt nghiệp', text: inviteText(guest) })
  } catch (err) {
    if (err?.name !== 'AbortError') copyText(inviteText(guest), 'Đã copy lời mời')
  }
}
