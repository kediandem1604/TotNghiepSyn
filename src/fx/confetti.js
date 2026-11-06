import { h, rand } from '../lib/dom.js'

const COLORS = ['#5fb6f2', '#93cffb', '#ffffff', '#f2c46d', '#bfe3ff', '#ffd9e2', '#3b9be3']
const MAX_PARTS = 140

function drawCap(c, s) {
  c.fillStyle = '#13304f'
  c.beginPath()
  c.moveTo(0, -s * 0.32)
  c.lineTo(s * 0.55, 0)
  c.lineTo(0, s * 0.32)
  c.lineTo(-s * 0.55, 0)
  c.closePath()
  c.fill()
  c.fillStyle = '#21497a'
  c.fillRect(-s * 0.28, s * 0.08, s * 0.56, s * 0.24)
  c.strokeStyle = '#f2c46d'
  c.lineWidth = Math.max(1.5, s * 0.06)
  c.beginPath()
  c.moveTo(0, 0)
  c.lineTo(s * 0.46, s * 0.05)
  c.lineTo(s * 0.46, s * 0.38)
  c.stroke()
  c.fillStyle = '#f2c46d'
  c.beginPath()
  c.arc(s * 0.46, s * 0.42, s * 0.08, 0, Math.PI * 2)
  c.fill()
}

/**
 * Pháo giấy trên một canvas toàn màn hình.
 * Chỉ chạy requestAnimationFrame khi còn hạt đang bay, xong thì ẩn canvas.
 */
export function createConfetti() {
  const canvas = h('canvas', { class: 'confetti', attrs: { 'aria-hidden': 'true' } })
  document.body.append(canvas)
  const c = canvas.getContext('2d')
  let parts = []
  let raf = 0
  let last = 0
  let dpr = 1

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
  }

  function tick(now) {
    const dt = Math.min(2.5, (now - last) / 16.67)
    last = now
    const W = window.innerWidth
    const H = window.innerHeight
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, W, H)
    const drag = Math.pow(0.985, dt)
    for (const p of parts) {
      p.vy = Math.min(p.vy + 0.3 * dt, p.cap ? 2.6 : 3.8)
      p.vx *= drag
      p.tilt += p.vt * dt
      p.x += (p.vx + Math.sin(p.tilt) * 0.7) * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt
      p.life += dt
      c.save()
      c.translate(p.x, p.y)
      c.rotate(p.rot)
      c.globalAlpha = p.life > 260 ? Math.max(0, 1 - (p.life - 260) / 60) : 1
      if (p.cap) drawCap(c, p.size)
      else {
        c.scale(1, Math.cos(p.tilt))
        c.fillStyle = p.color
        if (p.round) {
          c.beginPath()
          c.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
          c.fill()
        } else c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      }
      c.restore()
    }
    parts = parts.filter((p) => p.y < H + 60 && p.life < 320)
    if (parts.length) raf = requestAnimationFrame(tick)
    else {
      raf = 0
      c.clearRect(0, 0, W, H)
      canvas.style.display = 'none'
    }
  }

  /** Bắn pháo giấy từ (x, y). caps: thêm mũ tốt nghiệp. */
  function burst({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 120, caps = true, spread = 1.7, power = 1 } = {}) {
    if (!raf) {
      resize()
      canvas.style.display = 'block'
    }
    const room = Math.max(0, MAX_PARTS - parts.length)
    const capCount = caps ? Math.min(10, Math.round(count / 10)) : 0
    const n = Math.min(count, room)
    for (let i = 0; i < n; i++) {
      const isCap = i < capCount
      const angle = -Math.PI / 2 + rand(-spread / 2, spread / 2)
      const speed = rand(isCap ? 7 : 8, isCap ? 12 : 17) * power
      parts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isCap ? rand(22, 30) : rand(6, 11),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: rand(0, Math.PI * 2),
        vr: isCap ? rand(-0.06, 0.06) : rand(-0.2, 0.2),
        tilt: rand(0, Math.PI * 2),
        vt: rand(0.05, 0.14),
        round: Math.random() < 0.28,
        cap: isCap,
        life: 0,
      })
    }
    if (!raf) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  }

  window.addEventListener('resize', () => raf && resize(), { passive: true })
  return { burst }
}
