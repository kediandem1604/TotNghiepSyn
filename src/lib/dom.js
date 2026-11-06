/**
 * Tạo phần tử nhanh: h('button', { class: 'btn', text: 'Gửi', on: { click } }, child…)
 * - text: gán textContent (an toàn cho dữ liệu người dùng)
 * - html: chỉ dùng cho chuỗi tĩnh do mình viết (biểu tượng SVG)
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue
    if (key === 'class') el.className = value
    else if (key === 'text') el.textContent = value
    else if (key === 'html') el.innerHTML = value
    else if (key === 'style') for (const [p, v] of Object.entries(value)) p.startsWith('--') ? el.style.setProperty(p, v) : (el.style[p] = v)
    else if (key === 'attrs') for (const [a, v] of Object.entries(value)) v !== false && v != null && el.setAttribute(a, v === true ? '' : v)
    else if (key === 'on') for (const [ev, fn] of Object.entries(value)) el.addEventListener(ev, fn)
    else if (key === 'dataset') Object.assign(el.dataset, value)
    else el[key] = value
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue
    el.append(child instanceof Node ? child : document.createTextNode(String(child)))
  }
  return el
}

let toastWrap

/** Thông báo nhỏ ở đáy màn hình. kind: 'info' | 'success' | 'error' */
export function toast(message, kind = 'info') {
  if (!toastWrap) {
    toastWrap = h('div', { class: 'toast-wrap', attrs: { role: 'status', 'aria-live': 'polite' } })
    document.body.append(toastWrap)
  }
  const el = h('div', { class: `toast toast--${kind}`, text: message })
  toastWrap.append(el)
  setTimeout(() => {
    el.classList.add('is-out')
    el.addEventListener('animationend', () => el.remove(), { once: true })
    setTimeout(() => el.remove(), 600)
  }, kind === 'error' ? 4200 : 2800)
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export const rand = (min, max) => min + Math.random() * (max - min)
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/** Gọi fn một lần khi phần tử tiến gần màn hình. */
export function whenNear(el, fn, rootMargin = '200px 0px') {
  if (!('IntersectionObserver' in window)) return fn()
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect()
      fn()
    }
  }, { rootMargin })
  io.observe(el)
}

/** Tiêu đề section: dòng nhỏ + tiêu đề lớn + họa tiết mây. */
export function sectionHead(eyebrow, title) {
  return h('header', { class: 'section-head', attrs: { 'data-reveal': '' } },
    h('p', { class: 'eyebrow', text: eyebrow }),
    h('h2', { class: 'section-title', text: title }),
    h('div', { class: 'divider', attrs: { 'aria-hidden': 'true' }, html: DIVIDER }),
  )
}

const DIVIDER = `<span></span><svg viewBox="0 0 48 24" width="40" height="20"><path d="M12 20h26a8 8 0 0 0 0-16 11 11 0 0 0-21-1 7 7 0 0 0-5 17z" fill="#fff" stroke="#93cffb" stroke-width="1.6"/></svg><span></span>`
