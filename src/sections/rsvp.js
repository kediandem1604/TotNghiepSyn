import { h, sectionHead, toast } from '../lib/dom.js'
import { LIMITS } from '../../shared/constants.js'
import { eventRange, formatDateDots } from '../lib/time.js'

const STORE_KEY = 'thiep:rsvp'

const readStored = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || null
  } catch {
    return null
  }
}
const writeStored = (v) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(v))
  } catch {
    /* trình duyệt chặn lưu: bỏ qua */
  }
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function renderRsvp(root, ctx) {
  const { guest, api } = ctx
  const short = ctx.content.graduate.shortName
  const day = formatDateDots(eventRange(ctx.content.event).start).slice(0, 5).replace('.', '/')
  let stored = guest ? null : readStored()
  let attending = guest ? guest.rsvp?.attending ?? null : stored?.attending ?? null
  let sending = false

  const nameInput = guest
    ? null
    : h('input', {
        class: 'field',
        type: 'text',
        value: stored?.name || '',
        placeholder: 'Tên của bạn',
        maxLength: LIMITS.wishName,
        attrs: { 'aria-label': 'Tên của bạn', autocomplete: 'name' },
      })

  const yes = h('button', { class: 'rsvp__btn', attrs: { type: 'button' } }, h('span', { class: 'rsvp__emoji', text: '🎓' }), h('span', { text: 'Mình sẽ đến' }))
  const no = h('button', { class: 'rsvp__btn', attrs: { type: 'button' } }, h('span', { class: 'rsvp__emoji', text: '💌' }), h('span', { text: 'Tiếc quá, mình bận' }))
  const thanks = h('p', { class: 'rsvp__thanks', attrs: { 'aria-live': 'polite' } })

  function paint() {
    yes.classList.toggle('is-on', attending === true)
    no.classList.toggle('is-on', attending === false)
    yes.setAttribute('aria-pressed', String(attending === true))
    no.setAttribute('aria-pressed', String(attending === false))
    thanks.textContent =
      attending === true ? `Hẹn gặp ${ctx.displayName} ngày ${day} nha! ${short} vui lắm 🎓`
        : attending === false ? 'Tiếc quá, cảm ơn bạn đã báo nha 💙 Nhớ để lại lời chúc bên dưới nhé!'
          : ''
  }

  async function choose(value, btn) {
    if (sending) return
    const body = { attending: value }
    if (guest) body.slug = guest.slug
    else {
      const name = nameInput.value.trim()
      if (!name) {
        nameInput.focus()
        toast(`Bạn nhập tên giúp ${short} nhé`, 'error')
        return
      }
      body.name = name
      if (stored?.id) body.id = stored.id
    }
    sending = true
    yes.disabled = no.disabled = true
    try {
      const res = await api.sendRsvp(body)
      attending = value
      if (!guest) {
        stored = { id: res?.id || stored?.id, name: body.name, attending: value }
        writeStored(stored)
      }
      paint()
      if (value) {
        const r = btn.getBoundingClientRect()
        ctx.fx.burst({ x: r.left + r.width / 2, y: r.top, count: 50, caps: false, power: 0.7 })
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      sending = false
      yes.disabled = no.disabled = false
    }
  }

  yes.addEventListener('click', () => choose(true, yes))
  no.addEventListener('click', () => choose(false, no))
  paint()

  root.append(
    sectionHead('Xác nhận tham dự', `${capitalize(ctx.displayName)} sẽ đến chứ?`),
    h('div', { class: 'card rsvp', attrs: { 'data-reveal': '' } },
      h('p', { class: 'rsvp__lead muted', text: `Cho ${short} biết để chuẩn bị thật chu đáo nha` }),
      nameInput,
      h('div', { class: 'rsvp__choices' }, yes, no),
      thanks,
    ),
  )
}
