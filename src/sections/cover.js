import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { h } from '../lib/dom.js'
import { capSvg, planeSvg } from '../lib/icons.js'
import { eventRange, formatDateDots } from '../lib/time.js'
import { displayName } from '../lib/text.js'

gsap.registerPlugin(MotionPathPlugin)
if (import.meta.env.DEV) window.__gsap = gsap // chỉ để kiểm tra khi dev

// Dải mây lớn che màn hình khi chuyển cảnh (bên trái; bên phải lật ngang).
const BANK = `<svg viewBox="0 0 600 1000" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
  <defs><linearGradient id="bank" x1="0" x2="1"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#eef7ff"/></linearGradient></defs>
  <g fill="url(#bank)"><rect width="430" height="1000"/>
  <circle cx="430" cy="40" r="110"/><circle cx="470" cy="190" r="120"/><circle cx="430" cy="350" r="105"/>
  <circle cx="480" cy="500" r="125"/><circle cx="440" cy="660" r="110"/><circle cx="475" cy="820" r="120"/><circle cx="430" cy="970" r="105"/></g></svg>`

/** Màn hình bìa: máy bay giấy thả phong bì, bấm "Mở thiệp" để vào trang. */
export function renderCover(host, ctx) {
  const { content, reducedMotion } = ctx
  const range = eventRange(content.event)

  const seal = h('button', { class: 'envelope__seal', attrs: { type: 'button', 'aria-label': 'Mở thiệp' }, html: capSvg(30, '#13304f', '#fff6dc') })
  const flap = h('div', { class: 'envelope__flap' })
  const letter = h('div', { class: 'envelope__letter' },
    h('span', { class: 'letter__eyebrow script', text: 'Thư mời' }),
    h('span', { class: 'letter__title', text: 'Lễ Tốt Nghiệp' }),
    h('span', { class: 'letter__cap', html: capSvg(30, '#2378c2') }),
  )
  // Link riêng: để trống tên cho tới khi tải xong (tránh nháy "Bạn thân mến").
  const FALLBACK = 'Bạn thân mến'
  const guestName = h('span', { class: 'envelope__guest script', text: ctx.route.slug ? ' ' : FALLBACK })
  ctx.guestReady.then((guest) => {
    guestName.textContent = guest ? displayName(guest) : FALLBACK
    guestName.classList.add('is-in')
  })
  const envelope = h('div', { class: 'envelope' },
    h('div', { class: 'envelope__back' }),
    letter,
    h('div', { class: 'envelope__front' },
      h('span', { class: 'envelope__to', text: 'Thân gửi' }),
      guestName,
    ),
    flap,
    seal,
  )
  const openBtn = h('button', { class: 'btn btn--primary cover__open', attrs: { type: 'button' } },
    h('span', { text: 'Mở thiệp' }),
    h('span', { class: 'cover__open-icon', attrs: { 'aria-hidden': 'true' }, text: '✉' }),
  )
  const head = [
    h('p', { class: 'cover__eyebrow script', text: 'Thư mời tốt nghiệp' }),
    h('h1', { class: 'cover__name', text: content.graduate.fullName }),
    h('p', { class: 'cover__date', text: formatDateDots(range.start).replace(/\./g, ' · ') }),
  ]
  const { music } = content
  const hint = music?.src || music?.youtube || music?.spotify ? h('p', { class: 'cover__hint', text: '🎵 Thiệp có nhạc nền, nhớ bật âm thanh nhé' }) : null
  const stage = h('div', { class: 'cover__stage' }, ...head, envelope, openBtn, hint)
  const plane = h('div', { class: 'cover__plane', html: planeSvg(70) })
  const left = h('div', { class: 'cover__bank cover__bank--left', html: BANK })
  const right = h('div', { class: 'cover__bank cover__bank--right', html: BANK })
  const cover = h('div', { class: 'cover', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Thiệp mời tốt nghiệp' } }, stage, plane, left, right)

  host.append(cover)
  document.documentElement.classList.add('is-locked')

  // ── Cảnh mở đầu ──────────────────────────────────────────
  let idle
  if (reducedMotion) {
    plane.remove()
  } else {
    const W = window.innerWidth
    const H = window.innerHeight
    gsap.set([...head, openBtn, hint].filter(Boolean), { autoAlpha: 0, y: 16 })
    gsap.set(envelope, { autoAlpha: 0, y: -H * 0.32, scale: 0.35, rotation: -18 })
    const intro = gsap.timeline({ delay: 0.15 })
    intro
      .to(plane, {
        duration: 1.9,
        ease: 'power1.inOut',
        motionPath: {
          path: [
            { x: -90, y: H * 0.78 },
            { x: W * 0.28, y: H * 0.42 },
            { x: W * 0.52, y: H * 0.2 },
            { x: W * 0.82, y: H * 0.16 },
            { x: W + 120, y: -60 },
          ],
          curviness: 1.4,
          autoRotate: 17,
        },
      })
      .to(envelope, { duration: 1, autoAlpha: 1, y: 0, scale: 1, rotation: 0, ease: 'back.out(1.5)' }, 0.75)
      .to(head, { duration: 0.7, autoAlpha: 1, y: 0, stagger: 0.1, ease: 'power2.out' }, 1.15)
      .to([openBtn, hint].filter(Boolean), { duration: 0.6, autoAlpha: 1, y: 0, stagger: 0.12, ease: 'power2.out' }, 1.55)
      .add(() => {
        plane.remove()
        idle = gsap.to(envelope, { y: -7, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
  }

  // ── Mở thiệp ─────────────────────────────────────────────
  let opened = false
  function open() {
    if (opened) return
    opened = true
    openBtn.disabled = true
    idle?.kill()
    ctx.emitTap() // phát nhạc ngay trong cú chạm (iPhone chặn nếu gọi muộn hơn)

    const finish = () => {
      document.documentElement.classList.remove('is-locked')
      window.scrollTo(0, 0)
      ctx.emitOpen()
    }

    if (reducedMotion) {
      gsap.to(cover, { autoAlpha: 0, duration: 0.4, onComplete: () => cover.remove() })
      finish()
      return
    }

    gsap.timeline()
      .to(seal, { scale: 1.35, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .to(flap, { rotationX: 180, duration: 0.5, ease: 'power2.inOut' }, 0.15)
      .set(flap, { zIndex: 1 }, 0.4)
      .to(letter, { yPercent: -58, duration: 0.55, ease: 'power3.out' }, 0.5)
      .to([openBtn, hint, ...head].filter(Boolean), { autoAlpha: 0, y: -10, duration: 0.3, stagger: 0.03 }, 0.45)
      .to(left, { xPercent: 100, duration: 0.55, ease: 'power3.in' }, 0.85)
      .to(right, { xPercent: -100, duration: 0.55, ease: 'power3.in' }, 0.85)
      .add(() => {
        stage.remove()
        finish()
        ctx.fx.burst({ x: window.innerWidth / 2, y: window.innerHeight * 0.62, count: 130 })
      }, 1.42)
      .to(left, { xPercent: -10, scale: 1.1, duration: 0.95, ease: 'power2.inOut' }, 1.5)
      .to(right, { xPercent: 10, scale: 1.1, duration: 0.95, ease: 'power2.inOut' }, 1.5)
      .to(cover, { autoAlpha: 0, duration: 0.45 }, 2.0)
      .add(() => cover.remove())
  }

  openBtn.addEventListener('click', open)
  seal.addEventListener('click', open)
}
