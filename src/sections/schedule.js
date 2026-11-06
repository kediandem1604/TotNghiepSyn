import { h, sectionHead } from '../lib/dom.js'
import { icons, capSvg } from '../lib/icons.js'
import {
  eventRange, eventPhase, countdown, monthGrid, weekdayVi, googleCalendarUrl, buildIcs, timeOfDay,
} from '../lib/time.js'

const pad = (n) => String(n).padStart(2, '0')
const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function renderSchedule(root, ctx) {
  const { event, graduate, venue } = ctx.content
  const range = eventRange(event)
  const [y, m, d] = event.date.split('-').map(Number)

  // ── Ngày giờ lớn ──────────────────────────────────────
  const dateCard = h('div', { class: 'card date-card', attrs: { 'data-reveal': '' } },
    h('div', { class: 'date-card__row' },
      h('div', { class: 'date-card__side' }, h('span', { class: 'date-card__icon', html: icons.calendar }), h('span', { text: weekdayVi(range.start) })),
      h('div', { class: 'date-card__day', text: pad(d) }),
      h('div', { class: 'date-card__side' }, h('span', { class: 'date-card__icon', html: icons.clock }), h('span', { text: timeOfDay(event.start) })),
    ),
    h('p', { class: 'date-card__month', text: `Tháng ${m} · ${y}` }),
  )

  // ── Lịch tháng ────────────────────────────────────────
  const grid = monthGrid(y, m)
  const calendar = h('div', { class: 'card calendar', attrs: { 'data-reveal': '' }, style: { '--i': 1 } },
    h('p', { class: 'calendar__title', text: `Tháng ${m} / ${y}` }),
    h('div', { class: 'calendar__grid', attrs: { role: 'grid', 'aria-label': `Lịch tháng ${m} năm ${y}` } },
      WEEK.map((w) => h('span', { class: 'calendar__wd', text: w })),
      grid.flat().map((day) =>
        day === d
          ? h('span', { class: 'calendar__day is-event', attrs: { 'aria-label': `Ngày ${day}: lễ tốt nghiệp` } },
              h('span', { class: 'calendar__ring', attrs: { 'aria-hidden': 'true' } }),
              h('b', { text: day }),
              h('span', { class: 'calendar__cap', html: capSvg(18, '#13304f') }),
            )
          : h('span', { class: day ? 'calendar__day' : 'calendar__day is-empty', text: day ?? '' }),
      ),
    ),
  )

  // ── Đếm ngược ─────────────────────────────────────────
  const units = [['days', 'Ngày'], ['hours', 'Giờ'], ['minutes', 'Phút'], ['seconds', 'Giây']]
  const numbers = {}
  const countdownEl = h('div', { class: 'countdown', attrs: { 'data-reveal': '', 'aria-live': 'off' }, style: { '--i': 2 } },
    units.map(([key, label]) => {
      numbers[key] = h('span', { class: 'countdown__num', text: '00' })
      return h('div', { class: 'countdown__tile' }, numbers[key], h('span', { class: 'countdown__label', text: label }))
    }),
  )
  const phaseMsg = h('p', { class: 'countdown__msg', attrs: { 'data-reveal': '' } })

  let lastPhase
  function tick() {
    const now = new Date()
    const phase = eventPhase(now, range)
    if (phase !== lastPhase) {
      lastPhase = phase
      countdownEl.hidden = phase !== 'before'
      phaseMsg.hidden = phase === 'before'
      phaseMsg.textContent = phase === 'during'
        ? 'Lễ tốt nghiệp đang diễn ra 🎓'
        : 'Cảm ơn mọi người đã đến chung vui cùng ' + graduate.shortName + ' 💙'
    }
    if (phase !== 'before') return
    const left = countdown(now, range.start)
    for (const [key] of units) {
      const text = pad(left[key])
      const el = numbers[key]
      if (el.textContent !== text) {
        el.textContent = text
        el.classList.remove('tick')
        void el.offsetWidth // khởi động lại hiệu ứng lật
        el.classList.add('tick')
      }
    }
  }
  tick()

  // Chỉ chạy đồng hồ khi phần này đang trong màn hình.
  let timer
  const io = new IntersectionObserver(([entry]) => {
    clearInterval(timer)
    if (entry.isIntersecting) {
      tick()
      timer = setInterval(tick, 1000)
    }
  })

  // ── Thêm vào lịch ─────────────────────────────────────
  const title = `Lễ tốt nghiệp của ${graduate.fullName}`
  const location = [venue.name, venue.address].filter(Boolean).join(', ')
  const details = `Thư mời dự lễ tốt nghiệp của ${graduate.fullName}. Thiệp: ${window.location.href.split('?')[0]}`
  const gcal = h('a', {
    class: 'btn btn--primary',
    href: googleCalendarUrl({ title, details, location, ...range }),
    attrs: { target: '_blank', rel: 'noopener' },
    html: `${icons.calendar}<span>Google Calendar</span>`,
  })
  const ics = h('button', {
    class: 'btn btn--ghost',
    attrs: { type: 'button' },
    html: `${icons.download}<span>Lưu vào lịch (.ics)</span>`,
    on: {
      click() {
        const blob = new Blob([buildIcs({ title, details, location, uid: `tot-nghiep-${event.date}@thiep`, ...range })], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = h('a', { href: url, download: 'le-tot-nghiep.ics' })
        document.body.append(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 2000)
      },
    },
  })

  // Lưu ý: append() gốc biến null thành chữ "null" nên phải lọc bỏ phần trống.
  const parts = [
    sectionHead('Thời gian', 'Ngày chung vui'),
    dateCard,
    calendar,
    countdownEl,
    phaseMsg,
    h('div', { class: 'btn-row schedule__actions', attrs: { 'data-reveal': '' } }, gcal, ics),
    event.note ? h('p', { class: 'schedule__note', attrs: { 'data-reveal': '' }, text: event.note }) : null,
  ]
  root.append(...parts.filter(Boolean))
  io.observe(countdownEl)
}
