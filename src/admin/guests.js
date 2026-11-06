import { h, toast } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { displayName } from '../lib/text.js'
import { formatWishTime } from '../lib/time.js'
import { stripDiacritics } from '../../shared/slug.js'
import { LIMITS } from '../../shared/constants.js'
import { guestLink, previewLink, inviteText, copyText, canShare, shareInvite } from './share.js'

const norm = (s) => stripDiacritics(s).toLowerCase()

function linkActions(guest, { compact = false } = {}) {
  const btn = (icon, label, onClick, cls = '') =>
    h('button', {
      class: `btn btn--ghost btn--small ${cls}`,
      attrs: { type: 'button', title: label, 'aria-label': label },
      html: `${icon}${compact ? '' : `<span>${label}</span>`}`,
      on: { click: onClick },
    })
  return [
    btn(icons.copy, 'Copy link', () => copyText(guestLink(guest.slug), 'Đã copy link')),
    btn(icons.chat, 'Copy kèm lời mời', () => copyText(inviteText(guest), 'Đã copy lời mời')),
    canShare() ? btn(icons.share, 'Chia sẻ', () => shareInvite(guest)) : null,
  ]
}

export function renderGuestsTab(root, state) {
  // ── Thêm khách ────────────────────────────────────────
  const name = h('input', { class: 'field', type: 'text', placeholder: 'Tên khách, vd. Tiến Quốc', maxLength: LIMITS.guestName, attrs: { 'aria-label': 'Tên khách' } })
  const note = h('textarea', { class: 'field field--note', placeholder: 'Lời nhắn riêng cho người này (không bắt buộc)', maxLength: LIMITS.note, attrs: { rows: '2', 'aria-label': 'Lời nhắn riêng' } })
  const bulk = h('textarea', {
    class: 'field',
    placeholder: 'Mỗi dòng một người, ví dụ:\nTiến Quốc\nMinh Trí\nTường Vy',
    attrs: { rows: '6', 'aria-label': 'Danh sách khách' },
  })
  const result = h('div', { class: 'created' })
  let bulkMode = false

  const single = h('div', { class: 'add__fields' }, name, note)
  const many = h('div', { class: 'add__fields', hidden: true }, bulk, h('p', { class: 'muted add__hint', text: 'Tên ghi thế nào thì thiệp hiện đúng như vậy. Tối đa 200 người một lần.' }))
  const modeBtn = h('button', {
    class: 'linkish',
    attrs: { type: 'button' },
    text: 'Thêm nhiều người cùng lúc',
    on: {
      click() {
        bulkMode = !bulkMode
        single.hidden = bulkMode
        many.hidden = !bulkMode
        modeBtn.textContent = bulkMode ? 'Thêm từng người' : 'Thêm nhiều người cùng lúc'
        ;(bulkMode ? bulk : name).focus()
      },
    },
  })
  const submit = h('button', { class: 'btn btn--primary', attrs: { type: 'submit' }, html: `${icons.plus}<span>Tạo link mời</span>` })

  const addForm = h('form', { class: 'card add' },
    h('div', { class: 'add__head' }, h('h2', { class: 'card-title', text: 'Thêm khách mời' }), modeBtn),
    single,
    many,
    submit,
    result,
  )

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const guests = bulkMode
      ? bulk.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => ({ name: l }))
      : name.value.trim()
        ? [{ name: name.value.trim(), note: note.value.trim() }]
        : []
    if (!guests.length) {
      ;(bulkMode ? bulk : name).focus()
      return toast(bulkMode ? 'Bạn dán danh sách tên vào nhé' : 'Bạn nhập tên khách nhé', 'error')
    }
    submit.disabled = true
    try {
      const { created } = await state.api.addGuests(guests)
      name.value = note.value = bulk.value = ''
      result.replaceChildren(
        h('p', { class: 'created__title', text: `Đã tạo ${created.length} link mời 🎉` }),
        ...created.map((g) =>
          h('div', { class: 'created__item' },
            h('div', { class: 'created__info' }, h('b', { text: displayName(g) }), h('a', { href: previewLink(g.slug), target: '_blank', rel: 'noopener', title: 'Mở xem thử (không tính là khách đã mở)', text: guestLink(g.slug).replace(/^https?:\/\//, '') })),
            h('div', { class: 'created__actions' }, linkActions(g, { compact: created.length > 1 })),
          ),
        ),
      )
      await state.reload()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      submit.disabled = false
    }
  })

  // ── Danh sách khách ───────────────────────────────────
  const search = h('input', { class: 'field field--search', type: 'search', placeholder: 'Tìm tên khách…', attrs: { 'aria-label': 'Tìm khách' } })
  const list = h('div', { class: 'guest-list' })
  const listCount = h('span', { class: 'muted' })
  search.addEventListener('input', () => paintList())

  function badge(text, kind) {
    return h('span', { class: `badge badge--${kind}`, text })
  }

  function guestRow(g) {
    const opened = g.openCount > 0
    const rsvp = g.rsvp ? (g.rsvp.attending ? badge('Sẽ đến', 'yes') : badge('Không đến', 'no')) : badge('Chưa trả lời', 'idle')
    const row = h('article', { class: 'guest' },
      h('div', { class: 'guest__top' },
        h('div', { class: 'guest__who' },
          h('b', { class: 'guest__name', text: displayName(g) }),
          h('a', { class: 'guest__link', href: previewLink(g.slug), target: '_blank', rel: 'noopener', title: 'Mở xem thử (không tính là khách đã mở)', text: `/${g.slug}` }),
        ),
        h('div', { class: 'guest__badges' },
          opened
            ? h('span', { class: 'badge badge--open', attrs: { title: `Mở lần đầu: ${formatWishTime(g.firstOpenedAt)}` }, text: `Đã mở ${g.openCount} lần` })
            : badge('Chưa mở', 'idle'),
          rsvp,
        ),
      ),
      opened ? h('p', { class: 'guest__meta', text: `Mở lần đầu ${formatWishTime(g.firstOpenedAt)} · gần nhất ${formatWishTime(g.lastOpenedAt)}` }) : null,
      g.note ? h('p', { class: 'guest__note', text: `“${g.note}”` }) : null,
      h('div', { class: 'guest__actions' },
        ...linkActions(g, { compact: true }),
        h('a', { class: 'btn btn--ghost btn--small', href: previewLink(g.slug), target: '_blank', rel: 'noopener', attrs: { title: 'Xem thử (không tính là đã mở)', 'aria-label': 'Xem thử' }, html: icons.eye }),
        h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button', title: 'Sửa', 'aria-label': 'Sửa' }, html: icons.edit, on: { click: () => row.replaceWith(editRow(g)) } }),
        h('button', {
          class: 'btn btn--ghost btn--small btn--danger',
          attrs: { type: 'button', title: 'Xoá', 'aria-label': 'Xoá' },
          html: icons.trash,
          on: {
            async click() {
              if (!window.confirm(`Xoá khách "${displayName(g)}"? Link của người này sẽ không còn hiện tên.`)) return
              try {
                await state.api.deleteGuest(g.slug)
                toast('Đã xoá khách', 'success')
                await state.reload()
              } catch (err) {
                toast(err.message, 'error')
              }
            },
          },
        }),
      ),
    )
    return row
  }

  function editRow(g) {
    const n = h('input', { class: 'field', type: 'text', value: g.name, maxLength: LIMITS.guestName, attrs: { 'aria-label': 'Tên khách' } })
    const no = h('textarea', { class: 'field field--note', value: g.note, maxLength: LIMITS.note, attrs: { rows: '2', 'aria-label': 'Lời nhắn riêng', placeholder: 'Lời nhắn riêng' } })
    const form = h('form', { class: 'guest guest--edit' },
      h('p', { class: 'muted', text: `Đang sửa /${g.slug} (link giữ nguyên)` }),
      n, no,
      h('div', { class: 'guest__actions' },
        h('button', { class: 'btn btn--primary btn--small', attrs: { type: 'submit' }, html: `${icons.check}<span>Lưu</span>` }),
        h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button' }, text: 'Huỷ', on: { click: () => form.replaceWith(guestRow(g)) } }),
      ),
    )
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      try {
        // title: '' xoá xưng hô cũ còn lưu từ trước (thiệp không dùng nữa).
        await state.api.updateGuest(g.slug, { name: n.value, title: '', note: no.value })
        toast('Đã lưu', 'success')
        await state.reload()
      } catch (err) {
        toast(err.message, 'error')
      }
    })
    setTimeout(() => n.focus())
    return form
  }

  function paintList({ background = false } = {}) {
    // Tự làm mới khi quay lại tab: không xoá form đang sửa dở.
    if (background && list.querySelector('.guest--edit')) return
    const guests = [...state.data.guests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const q = norm(search.value.trim())
    const shown = q ? guests.filter((g) => norm(`${g.name} ${g.slug}`).includes(q)) : guests
    listCount.textContent = q ? `${shown.length}/${guests.length} khách` : `${guests.length} khách`
    list.replaceChildren(
      ...(shown.length
        ? shown.map(guestRow)
        : [h('p', { class: 'empty', text: guests.length ? 'Không tìm thấy khách nào' : 'Chưa có khách nào. Thêm khách ở trên để tạo link mời nhé!' })]),
    )
  }

  root.replaceChildren(
    addForm,
    h('section', { class: 'card' },
      h('div', { class: 'list-head' }, h('h2', { class: 'card-title', text: 'Danh sách khách' }), listCount),
      search,
      list,
    ),
  )
  paintList()
  return { update: paintList }
}
