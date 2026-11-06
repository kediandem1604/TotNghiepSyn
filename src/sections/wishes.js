import { h, sectionHead, toast, whenNear, rand } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { formatWishTime } from '../lib/time.js'
import { LIMITS, REACTIONS, WISH_EMOJIS } from '../../shared/constants.js'
import { createHoldTap } from '../lib/hold-tap.js'
import { nextFlushDelay } from '../lib/reactions.js'

const POLL_MS = 15000
const FLUSH_MS = 1500
const HOLD_MS = 125
const HOLD_DELAY_MS = 250
const NAME_KEY = 'thiep:name'

const store = {
  get(k) {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* bỏ qua */
    }
  },
}

function wishCard(w, isNew = false) {
  return h('article', { class: `wish${isNew ? ' wish--new' : ''}`, dataset: { id: w.id } },
    h('span', { class: 'wish__emoji', attrs: { 'aria-hidden': 'true' }, text: w.emoji }),
    h('div', { class: 'wish__body' },
      h('header', { class: 'wish__head' },
        h('b', { class: 'wish__name', text: w.name }),
        h('time', { class: 'wish__time', attrs: { datetime: w.at }, text: formatWishTime(w.at) }),
      ),
      h('p', { class: 'wish__msg', text: w.message }),
    ),
  )
}

const centerOf = (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 3 }
}

export function renderWishes(root, ctx) {
  const { api, guest, fx, content } = ctx
  const short = content.graduate.shortName
  const suggestions = content.wishSuggestions || []

  // ── Form gửi lời chúc ─────────────────────────────────
  let storedRsvpName = ''
  try {
    storedRsvpName = JSON.parse(store.get('thiep:rsvp'))?.name || ''
  } catch {
    /* bỏ qua */
  }
  const nameInput = h('input', {
    class: 'field',
    type: 'text',
    value: guest?.name || store.get(NAME_KEY) || storedRsvpName,
    placeholder: 'Tên của bạn',
    maxLength: LIMITS.wishName,
    required: true,
    attrs: { 'aria-label': 'Tên của bạn', autocomplete: 'name' },
  })
  const counter = h('span', { class: 'wish-form__count', text: `0/${LIMITS.wishMessage}` })
  const message = h('textarea', {
    class: 'field',
    placeholder: `Viết đôi dòng chúc mừng ${short} nhé…`,
    maxLength: LIMITS.wishMessage,
    required: true,
    attrs: { 'aria-label': 'Lời chúc', rows: '4' },
    on: { input: () => (counter.textContent = `${message.value.length}/${LIMITS.wishMessage}`) },
  })
  const honeypot = h('input', { class: 'wish-form__trap', type: 'text', name: 'website', tabIndex: -1, attrs: { autocomplete: 'off', 'aria-hidden': 'true' } })

  let chosen = WISH_EMOJIS[0]
  const emojiBtns = WISH_EMOJIS.map((e) =>
    h('button', {
      class: 'emoji-pick',
      text: e,
      attrs: { type: 'button', 'aria-pressed': String(e === chosen), 'aria-label': `Chọn cảm xúc ${e}` },
      on: {
        click() {
          chosen = e
          emojiBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === e)))
        },
      },
    }),
  )

  let lastTip = -1
  const tipBtn = h('button', {
    class: 'btn btn--ghost wish-form__tip',
    attrs: { type: 'button', 'aria-label': 'Gợi ý lời chúc', title: 'Gợi ý lời chúc' },
    html: icons.bulb,
    on: {
      click() {
        if (!suggestions.length) return
        let i
        do i = Math.floor(Math.random() * suggestions.length)
        while (suggestions.length > 1 && i === lastTip)
        lastTip = i
        message.value = suggestions[i].slice(0, LIMITS.wishMessage)
        message.dispatchEvent(new Event('input'))
        message.focus()
      },
    },
  })
  const sendBtn = h('button', { class: 'btn btn--primary wish-form__send', attrs: { type: 'submit' }, html: `${icons.send}<span>Gửi lời chúc</span>` })

  const form = h('form', { class: 'card wish-form', attrs: { 'data-reveal': '', novalidate: true } },
    nameInput,
    h('div', { class: 'wish-form__msg' }, message, counter),
    h('div', { class: 'wish-form__emojis', attrs: { role: 'group', 'aria-label': 'Cảm xúc đi kèm' } },
      h('span', { class: 'wish-form__label', text: 'Cảm xúc' }), ...emojiBtns),
    h('div', { class: 'wish-form__actions' }, tipBtn, sendBtn),
    honeypot,
  )

  // ── Danh sách lời chúc ────────────────────────────────
  const countLabel = h('p', { class: 'wall__count' })
  const list = h('div', { class: 'wall__list', attrs: { 'aria-live': 'polite' } })
  const wall = h('div', { class: 'wall', attrs: { 'data-reveal': '' } }, countLabel, list)
  const ids = new Set()

  function paintCount() {
    const n = ids.size
    countLabel.textContent = n ? `${n} lời chúc gửi đến ${short}` : ''
    if (!n && !list.querySelector('.wall__empty, .wall__error')) {
      list.append(h('p', { class: 'wall__empty', text: 'Hãy là người đầu tiên gửi lời chúc 💙' }))
    }
    if (n) list.querySelector('.wall__empty')?.remove()
  }

  function syncWishes(wishes, { animate }) {
    list.querySelector('.wall__error')?.remove()
    const serverIds = new Set(wishes.map((w) => w.id))
    for (const el of [...list.querySelectorAll('.wish')]) {
      if (!serverIds.has(el.dataset.id)) {
        ids.delete(el.dataset.id)
        el.remove()
      }
    }
    // Danh sách từ máy chủ đã xếp mới nhất trước: chèn ngược để giữ thứ tự.
    for (const w of wishes.slice().reverse()) addWish(w, animate)
    paintCount()
  }

  function addWish(w, animate) {
    if (ids.has(w.id)) return
    ids.add(w.id)
    list.prepend(wishCard(w, animate))
  }

  // ── Thanh cảm xúc ─────────────────────────────────────
  const known = Object.fromEntries(REACTIONS.map((r) => [r.key, 0]))
  const pending = Object.fromEntries(REACTIONS.map((r) => [r.key, 0]))
  const inFlight = Object.fromEntries(REACTIONS.map((r) => [r.key, 0]))
  const countEls = {}
  const reactBtns = {}

  const paintReactions = () => {
    for (const r of REACTIONS) countEls[r.key].textContent = String(known[r.key] + inFlight[r.key] + pending[r.key])
  }

  let flushTimer
  const scheduleFlush = (ms = FLUSH_MS) => {
    clearTimeout(flushTimer)
    flushTimer = setTimeout(flush, ms)
  }

  async function flush() {
    if (Object.values(inFlight).some(Boolean)) return scheduleFlush()
    const batch = {}
    for (const r of REACTIONS) {
      const n = Math.min(pending[r.key], LIMITS.reactionPerRequest)
      if (n) {
        batch[r.key] = n
        pending[r.key] -= n
        inFlight[r.key] = n
      }
    }
    if (!Object.keys(batch).length) return
    let ok = false
    try {
      const res = await api.sendReactions(batch)
      Object.assign(known, res.counts)
      ok = true
    } catch {
      for (const [k, n] of Object.entries(batch)) pending[k] += n // gửi lại lần sau
    } finally {
      for (const k of Object.keys(batch)) inFlight[k] = 0
      paintReactions()
      const delay = nextFlushDelay({ ok, hasPending: Object.values(pending).some(Boolean) })
      if (delay !== null) scheduleFlush(delay)
    }
  }

  function tap(r) {
    pending[r.key]++
    paintReactions()
    const btn = reactBtns[r.key]
    const { x, y } = centerOf(btn)
    fx.floatEmoji(r.emoji, { x: x + rand(-8, 8), y })
    btn.classList.remove('is-bump')
    void btn.offsetWidth
    btn.classList.add('is-bump')
    scheduleFlush()
  }

  const bar = h('div', { class: 'reactions', attrs: { 'data-reveal': '', role: 'group', 'aria-label': `Thả cảm xúc cho ${short}` } },
    h('p', { class: 'reactions__title', text: `Thả cảm xúc cho ${short} — giữ để bay liên tục` }),
    h('div', { class: 'reactions__row' },
      REACTIONS.map((r) => {
        countEls[r.key] = h('span', { class: 'reaction__count', text: '0' })
        // Chạm nhanh = 1 lần, giữ = bay liên tục; vuốt để cuộn trang thì không tính.
        const press = createHoldTap(() => tap(r), { holdDelay: HOLD_DELAY_MS, interval: HOLD_MS })
        const btn = h('button', {
          class: 'reaction',
          attrs: { type: 'button', 'aria-label': r.label },
          on: {
            pointerdown(e) {
              if (e.button !== undefined && e.button !== 0) return
              press.down()
            },
            pointerup: () => press.up(),
            pointerleave: () => press.cancel(),
            pointercancel: () => press.cancel(),
            contextmenu: (e) => e.preventDefault(),
            click(e) {
              if (e.detail === 0) tap(r) // bấm bằng bàn phím
            },
          },
        }, h('span', { class: 'reaction__emoji', text: r.emoji }), countEls[r.key])
        reactBtns[r.key] = btn
        return btn
      }),
    ),
  )

  // Cảm xúc của người khác bay lên từ thanh cảm xúc.
  function floatOthers(diff) {
    const rect = bar.getBoundingClientRect()
    let budget = 12
    for (const r of REACTIONS) {
      for (let i = 0; i < diff[r.key] && budget > 0; i++, budget--) {
        setTimeout(() => {
          fx.floatEmoji(r.emoji, {
            x: rand(rect.left + 20, rect.right - 20),
            y: Math.min(rect.top + 30, window.innerHeight - 40),
          })
        }, rand(0, 1400))
      }
    }
  }

  // ── Tải & cập nhật như live ───────────────────────────
  let loaded = false
  async function refresh({ initial = false } = {}) {
    try {
      const data = await api.getWishes()
      syncWishes(data.wishes, { animate: !initial })
      const busy = Object.values(inFlight).some(Boolean)
      if (!busy) {
        const diff = {}
        for (const r of REACTIONS) diff[r.key] = Math.max(0, (data.reactions[r.key] || 0) - known[r.key])
        Object.assign(known, data.reactions)
        if (!initial) floatOthers(diff)
      }
      paintReactions()
      loaded = true
    } catch (err) {
      if (!loaded && !list.querySelector('.wall__error')) {
        list.querySelector('.wall__empty')?.remove()
        list.append(
          h('div', { class: 'wall__error' },
            h('p', { text: 'Chưa tải được lời chúc, thử lại sau nhé.' }),
            h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button' }, text: 'Thử lại', on: { click: () => refresh({ initial: true }) } }),
          ),
        )
      }
    }
  }

  let seen = false
  whenNear(root, () => {
    seen = true
    refresh({ initial: true })
  }, '400px 0px')
  setInterval(() => {
    if (seen && !document.hidden) refresh()
  }, POLL_MS)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && seen) refresh()
  })

  // ── Gửi lời chúc ──────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = nameInput.value.trim()
    const text = message.value.trim()
    if (!name) {
      nameInput.focus()
      return toast('Bạn nhập tên trước nhé', 'error')
    }
    if (!text) {
      message.focus()
      return toast(`Bạn viết vài dòng chúc ${short} nhé`, 'error')
    }
    sendBtn.disabled = true
    try {
      const wish = await api.sendWish({ name, message: text, emoji: chosen, slug: guest?.slug, website: honeypot.value })
      if (!guest) store.set(NAME_KEY, name)
      message.value = ''
      message.dispatchEvent(new Event('input'))
      addWish(wish, true)
      paintCount()
      list.scrollTo({ top: 0, behavior: 'smooth' })
      const { x, y } = centerOf(sendBtn)
      for (let i = 0; i < 10; i++) setTimeout(() => fx.floatEmoji(chosen, { x: x + rand(-30, 30), y }), i * 70)
      toast(`Đã gửi lời chúc đến ${short} 💙`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      sendBtn.disabled = false
    }
  })

  root.append(sectionHead('Sổ lưu bút', `Gửi lời chúc đến ${short}`), form, bar, wall)
  paintCount()
}
