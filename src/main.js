import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sky.css'
import './styles/sections.css'

import content from '../content.js'
import { api } from './lib/api.js'
import { h, prefersReducedMotion } from './lib/dom.js'
import { parseRoute } from './lib/route.js'
import { displayName } from './lib/text.js'
import { initSky } from './fx/sky.js'
import { initReveal } from './fx/reveal.js'
import { createMusic } from './sections/music.js'

// Thứ tự các phần trên trang. Phần nào chưa có module thì bỏ qua.
const SECTIONS = [
  // ['hero', renderHero], … (được thêm dần)
]

/** Dựng một phần; lỗi chỉ ẩn phần đó, các phần khác vẫn chạy. */
function mountSection(page, id, render, ctx) {
  const el = h('section', { class: `section section--${id}`, id: `s-${id}` })
  page.append(el)
  try {
    render(el, ctx)
  } catch (err) {
    el.hidden = true
    console.error(`[thiệp] Lỗi khi dựng phần "${id}":`, err)
  }
}

async function loadGuest(slug) {
  if (!slug) return null
  try {
    return { slug, ...(await api.getGuest(slug)) }
  } catch {
    return null // khách không tồn tại / lỗi mạng → thiệp chung
  }
}

async function boot() {
  if (location.pathname.replace(/\/+$/, '') === '/quan-li') {
    location.replace('/quan-li/')
    return
  }

  const reducedMotion = prefersReducedMotion()
  const route = parseRoute(location)
  initSky({ reducedMotion })

  const openCallbacks = []
  const ctx = {
    content,
    route,
    api,
    reducedMotion,
    guest: null,
    displayName: displayName(null),
    guestReady: loadGuest(route.slug),
    fx: { burst() {}, floatEmoji() {} },
    onOpen: (cb) => openCallbacks.push(cb),
    emitOpen() {
      document.documentElement.classList.add('is-opened')
      openCallbacks.splice(0).forEach((cb) => {
        try {
          cb()
        } catch (err) {
          console.error(err)
        }
      })
    },
  }

  const music = createMusic(content.music, { reducedMotion })
  ctx.onOpen(() => music.start())

  ctx.guest = await ctx.guestReady
  ctx.displayName = displayName(ctx.guest)
  if (ctx.guest && !route.preview) ctx.onOpen(() => api.markOpened(ctx.guest.slug).catch(() => {}))

  const page = h('main', { class: 'page', id: 'trang' })
  document.getElementById('app').append(page)
  for (const [id, render] of SECTIONS) mountSection(page, id, render, ctx)

  initReveal(page)
  if (!SECTIONS.some(([id]) => id === 'cover')) ctx.emitOpen()
}

boot()
