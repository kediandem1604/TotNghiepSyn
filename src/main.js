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

import baseContent from '../content.js'
import { mergeSettings } from '../shared/settings.js'
import { loadSettings } from './lib/load-settings.js'
import { api } from './lib/api.js'
import { h, prefersReducedMotion } from './lib/dom.js'
import { parseRoute } from './lib/route.js'
import { displayName, pageTitle } from './lib/text.js'
import { withTimeout } from './lib/async.js'
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

const GUEST_TIMEOUT_MS = 2500

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

  // Tải tên khách và cài đặt cùng lúc. Bìa và nhạc cần cài đặt (tên, ngày, link nhạc)
  // nên chờ cài đặt, tối đa 2,5 giây; lỗi hoặc chậm thì dùng nội dung gốc trong content.js.
  const guestReady = withTimeout(loadGuest(route.slug), GUEST_TIMEOUT_MS).catch(() => null)
  const content = mergeSettings(baseContent, await loadSettings(api.getConfig))
  document.title = pageTitle(content)

  const safe = (cb) => {
    try {
      cb()
    } catch (err) {
      console.error(err)
    }
  }
  const openCallbacks = []
  const tapCallbacks = []
  let opened = false
  const ctx = {
    content,
    route,
    api,
    reducedMotion,
    guest: null,
    displayName: displayName(null),
    // Mạng chậm/treo thì sau 2,5 giây dùng thiệp chung, không để khách chờ mãi.
    guestReady,
    fx: { burst() {}, floatEmoji() {} },
    /** Chạy khi thiệp đã mở xong (đăng ký sau lúc mở thì chạy ngay). */
    onOpen: (cb) => (opened ? safe(cb) : openCallbacks.push(cb)),
    emitOpen() {
      opened = true
      document.documentElement.classList.add('is-opened')
      openCallbacks.splice(0).forEach(safe)
    },
    /** Chạy ngay trong cú chạm "Mở thiệp" — iPhone chỉ cho phát nhạc lúc này. */
    onTap: (cb) => tapCallbacks.push(cb),
    emitTap: () => tapCallbacks.splice(0).forEach(safe),
  }

  ctx.fx.burst = createConfetti().burst
  ctx.fx.floatEmoji = floatEmoji
  const music = createMusic(content.music, { reducedMotion })
  ctx.music = music
  ctx.onTap(() => music.start())

  // Bìa hiện ngay; tên khách được điền vào khi tải xong.
  try {
    renderCover(document.body, ctx)
  } catch (err) {
    console.error('[thiệp] Lỗi khi dựng bìa:', err)
    document.documentElement.classList.remove('is-locked')
    ctx.emitOpen()
  }

  ctx.guest = await ctx.guestReady
  ctx.displayName = displayName(ctx.guest)
  if (ctx.guest && !route.preview) ctx.onOpen(() => api.markOpened(ctx.guest.slug).catch(() => {}))

  const page = h('main', { class: 'page', id: 'trang' })
  document.getElementById('app').append(page)
  for (const [id, render] of SECTIONS) mountSection(page, id, render, ctx)

  initReveal(page)
}

boot()
