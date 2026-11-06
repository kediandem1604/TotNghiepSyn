import { h, sectionHead } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { facebookLink } from '../../shared/facebook.js'

export function renderContact(root, ctx) {
  const { contact, graduate } = ctx.content
  const digits = (s) => String(s || '').replace(/[^\d+]/g, '')
  // Ô Facebook lưu ở contact.messenger (tên cũ, giữ để không mất dữ liệu đã lưu).
  const fb = facebookLink(contact.messenger)
  const items = [
    contact.phone && { href: `tel:${digits(contact.phone)}`, icon: icons.phone, label: 'Gọi điện', sub: contact.phone },
    contact.zalo && { href: `https://zalo.me/${digits(contact.zalo).replace(/^\+84/, '0')}`, icon: icons.chat, label: 'Nhắn Zalo', sub: contact.zalo },
    fb && { href: fb.href, icon: icons.facebook, label: 'Facebook', sub: fb.text },
  ].filter(Boolean)

  if (!items.length) {
    root.hidden = true
    return
  }

  root.append(
    sectionHead('Liên hệ', `Cần gì cứ nhắn ${graduate.shortName} nha`),
    h('div', { class: 'contact', attrs: { 'data-reveal': '' } },
      items.map((it, i) =>
        h('a', {
          class: 'contact__item',
          href: it.href,
          style: { '--i': i },
          attrs: it.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {},
        },
          h('span', { class: 'contact__icon', html: it.icon }),
          h('span', { class: 'contact__text' }, h('b', { text: it.label }), h('small', { text: it.sub })),
        ),
      ),
    ),
  )
}
