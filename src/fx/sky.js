import { h, clamp } from '../lib/dom.js'

// Hình đám mây: các vòng tròn + đế bo tròn, tô gradient trắng → xanh rất nhạt.
const PUFFS = [
  [0, 0, 34],
  [38, -20, 44],
  [86, -10, 38],
  [122, 6, 28],
  [-30, 10, 24],
]

function cloud(x, y, scale, opacity) {
  const circles = PUFFS.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
  return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">${circles}<rect x="-40" y="0" width="190" height="34" rx="17"/></g>`
}

/** Dải mây rộng 2000 đơn vị; nửa sau lặp lại nửa đầu để trôi liền mạch. */
function cloudStrip(id, clouds, height) {
  // Vẽ 3 bản (lệch -1000, 0, +1000) để mây vắt qua mép vẫn liền khi vòng lặp quay lại.
  const all = [-1000, 0, 1000].map((dx) => clouds.map(([x, y, s, o]) => cloud(x + dx, y, s, o)).join('')).join('')
  return `<svg viewBox="0 0 2000 ${height}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e4f2ff"/></linearGradient></defs>
    <g fill="url(#${id})">${all}</g></svg>`
}

const FAR = [
  [60, 70, 0.55, 0.55],
  [300, 140, 0.4, 0.45],
  [520, 60, 0.6, 0.5],
  [760, 160, 0.45, 0.45],
  [900, 90, 0.5, 0.5],
]
const MID = [
  [40, 120, 1, 0.75],
  [420, 70, 0.8, 0.7],
  [700, 150, 1.1, 0.75],
]
const NEAR = [
  [-20, 120, 1.7, 0.92],
  [460, 150, 1.4, 0.88],
  [820, 110, 1.6, 0.9],
]

/**
 * Nền trời cố định: 3 lớp màu (sáng sớm / giữa trưa / hoàng hôn) đổi độ
 * trong suốt theo vị trí cuộn, mặt trời lặn dần, 3 lớp mây trôi ngang.
 */
export function initSky({ reducedMotion = false } = {}) {
  const dawn = h('div', { class: 'sky__layer sky__layer--dawn' })
  const dusk = h('div', { class: 'sky__layer sky__layer--dusk' })
  const sun = h('div', { class: 'sky__sun' })
  const sky = h(
    'div',
    { class: `sky${reducedMotion ? ' is-static' : ''}`, attrs: { 'aria-hidden': 'true' } },
    h('div', { class: 'sky__layer sky__layer--noon' }),
    dawn,
    dusk,
    sun,
    h('div', { class: 'clouds clouds--far', html: cloudStrip('cg-far', FAR, 260) }),
    h('div', { class: 'clouds clouds--mid', html: cloudStrip('cg-mid', MID, 260) }),
    h('div', { class: 'clouds clouds--near', html: cloudStrip('cg-near', NEAR, 280) }),
  )
  document.body.prepend(sky)

  let ticking = false
  function paint() {
    ticking = false
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
    dawn.style.opacity = String(1 - clamp(p / 0.22, 0, 1))
    dusk.style.opacity = String(clamp((p - 0.62) / 0.33, 0, 1))
    sun.style.transform = `translate3d(0, ${(p * 38).toFixed(2)}vh, 0)`
  }
  const onScroll = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(paint)
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  paint()

  // Tạm dừng mây trôi khi chuyển tab để đỡ tốn pin.
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('is-hidden', document.hidden)
  })

  return { refresh: onScroll }
}
