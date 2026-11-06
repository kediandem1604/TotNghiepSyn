import { h, rand } from '../lib/dom.js'

const MAX_ACTIVE = 40
let layer
let active = 0

/**
 * Cho một emoji bay lên từ (x, y) — toạ độ màn hình — lượn nhẹ rồi tan.
 * Tối đa 40 emoji cùng lúc để máy yếu vẫn mượt.
 */
export function floatEmoji(emoji, { x = window.innerWidth / 2, y = window.innerHeight - 80, size } = {}) {
  if (active >= MAX_ACTIVE) return
  if (!layer) {
    layer = h('div', { class: 'floaters', attrs: { 'aria-hidden': 'true' } })
    document.body.append(layer)
  }
  const dur = rand(1.6, 2.4)
  const el = h(
    'span',
    {
      class: 'floater',
      style: {
        left: `${x}px`,
        top: `${y}px`,
        '--dx': `${rand(-60, 60).toFixed(0)}px`,
        '--rot': `${rand(-25, 25).toFixed(0)}deg`,
        '--rise': `${rand(45, 75).toFixed(0)}vh`,
        '--dur': `${dur.toFixed(2)}s`,
        '--size': `${(size ?? rand(26, 38)).toFixed(0)}px`,
        '--sway': `${rand(0.7, 1.1).toFixed(2)}s`,
      },
    },
    h('span', { class: 'floater__inner', text: emoji }),
  )
  active++
  let done = false
  const remove = () => {
    if (done) return
    done = true
    el.remove()
    active--
  }
  el.addEventListener('animationend', (e) => e.target === el && remove())
  setTimeout(remove, dur * 1000 + 600) // phòng khi tab ẩn và animationend không chạy
  layer.append(el)
}
