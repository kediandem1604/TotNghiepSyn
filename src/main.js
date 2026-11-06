import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sky.css'
import './styles/sections.css'
import './styles/cover.css'
import './styles/hero.css'
import './styles/info.css'
import './styles/schedule.css'
import './styles/venue.css'
import './styles/rsvp.css'
import './styles/wishes.css'

import content from '../content.js'
import { api } from './lib/api.js'
import { h, prefersReducedMotion } from './lib/dom.js'
import { parseRoute } from './lib/route.js'
import { displayName } from './lib/text.js'
import { initSky } from './fx/sky.js'
import { initReveal } from './fx/reveal.js'
import { createMusic } from './sections/music.js'
import { createConfetti } from './fx/confetti.js'
import { renderCover } from './sections/cover.js'
import { renderHero } from './sections/hero.js'
import { renderInvite } from './sections/invite.js'
import { renderSchedule } from './sections/schedule.js'
import { renderVenue } from './sections/venue.js'
import { renderGallery } from './sections/gallery.js'
import { renderRsvp } from './sections/rsvp.js'
import { renderWishes } from './sections/wishes.js'
import { renderContact } from './sections/contact.js'
import { floatEmoji } from './fx/floaters.js'
import { renderClosing } from './sections/closing.js'

// Thứ tự các phần trên trang.
const SECTIONS = [
  ['hero', renderHero],
  ['invite', renderInvite],
  ['schedule', renderSchedule],
  ['venue', renderVenue],
  ['gallery', renderGallery],
  ['rsvp', renderRsvp],
  ['wishes', renderWishes],
  ['contact', renderContact],
  ['closing', renderClosing],
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

  ctx.fx.burst = createConfetti().burst
  ctx.fx.floatEmoji = floatEmoji
  const music = createMusic(content.music, { reducedMotion })
  ctx.onOpen(() => music.start())

  ctx.guest = await ctx.guestReady
  ctx.displayName = displayName(ctx.guest)
  if (ctx.guest && !route.preview) ctx.onOpen(() => api.markOpened(ctx.guest.slug).catch(() => {}))

  try {
    renderCover(document.body, ctx)
  } catch (err) {
    console.error('[thiệp] Lỗi khi dựng bìa:', err)
    document.documentElement.classList.remove('is-locked')
    ctx.emitOpen()
  }

  const page = h('main', { class: 'page', id: 'trang' })
  document.getElementById('app').append(page)
  for (const [id, render] of SECTIONS) mountSection(page, id, render, ctx)

  initReveal(page)
}

boot()
