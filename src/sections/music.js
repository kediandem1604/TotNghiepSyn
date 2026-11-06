import { h } from '../lib/dom.js'

const DISC = `<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
  <circle cx="24" cy="24" r="23" fill="#13304f"/>
  <circle cx="24" cy="24" r="18" fill="none" stroke="#2a4a6e" stroke-width="1"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#2a4a6e" stroke-width="1"/>
  <path d="M10 18a16 16 0 0 1 9-9" stroke="#5c7fa6" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="8.5" fill="#5fb6f2"/>
  <circle cx="24" cy="24" r="2.2" fill="#fff"/>
</svg>`

/** Nút nhạc nổi góc dưới trái. Không có file nhạc hoặc file lỗi → nút ẩn. */
export function createMusic(music, { reducedMotion = false } = {}) {
  const noop = { start: async () => {}, toggle() {}, el: null }
  if (!music?.src) return noop

  const audio = new Audio()
  audio.src = music.src
  audio.loop = true
  audio.preload = 'none'

  const label = music.title ? `Nhạc nền: ${music.title}` : 'Nhạc nền'
  const btn = h(
    'button',
    { class: 'music is-off', attrs: { type: 'button', 'aria-label': `Bật ${label.toLowerCase()}`, 'aria-pressed': 'false' } },
    h('span', { class: 'music__disc', html: DISC }),
    h('span', { class: 'music__bars', attrs: { 'aria-hidden': 'true' } }, h('i'), h('i'), h('i')),
  )
  document.body.append(btn)

  let fadeTimer
  const setState = (playing) => {
    btn.classList.toggle('is-off', !playing)
    btn.setAttribute('aria-pressed', String(playing))
    btn.setAttribute('aria-label', `${playing ? 'Tắt' : 'Bật'} ${label.toLowerCase()}`)
  }

  audio.addEventListener('error', () => btn.remove())
  audio.addEventListener('play', () => setState(true))
  audio.addEventListener('pause', () => setState(false))

  function fadeIn() {
    clearInterval(fadeTimer)
    if (reducedMotion) {
      audio.volume = 0.6
      return
    }
    audio.volume = 0
    const startAt = performance.now()
    fadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - startAt) / 2000)
      audio.volume = 0.6 * t
      if (t >= 1) clearInterval(fadeTimer)
    }, 50)
  }

  async function start() {
    try {
      fadeIn()
      await audio.play()
    } catch {
      // Trình duyệt chặn tự phát: khách bấm nút nhạc để bật.
      setState(false)
    }
  }

  function toggle() {
    if (audio.paused) start()
    else audio.pause()
  }

  btn.addEventListener('click', toggle)
  return { start, toggle, el: btn }
}
