import '../styles/fonts.css'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/sections.css'
import '../styles/rsvp.css'
import '../styles/admin.css'

import baseContent from '../../content.js'
import { mergeSettings } from '../../shared/settings.js'
import { h, toast } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { createAdminApi } from '../lib/api.js'
import { eventRange, formatDateDots } from '../lib/time.js'
import { renderLogin } from './login.js'
import { renderGuestsTab } from './guests.js'
import { renderWishesTab, renderRsvpTab } from './wishes.js'
import { renderSettingsTab } from './settings.js'

/** Cài đặt đã lưu; lỗi thì null (tab Cài đặt sẽ báo, không cho sửa đè). */
const fetchSettings = (api) => api.getConfig().then((r) => r.settings, () => null)

const PASS_KEY = 'thiep:admin'
const TAB_KEY = 'thiep:admin-tab'
const root = document.getElementById('admin')

const session = {
  get: () => {
    try {
      return sessionStorage.getItem(PASS_KEY)
    } catch {
      return null
    }
  },
  set: (v) => {
    try {
      v ? sessionStorage.setItem(PASS_KEY, v) : sessionStorage.removeItem(PASS_KEY)
    } catch {
      /* bỏ qua */
    }
  },
}

function stats(data) {
  const { guests, rsvps, wishes } = data
  const yes = guests.filter((g) => g.rsvp?.attending === true).length + rsvps.filter((r) => r.attending).length
  const no = guests.filter((g) => g.rsvp?.attending === false).length + rsvps.filter((r) => !r.attending).length
  const items = [
    ['Khách mời', guests.length],
    ['Đã mở thiệp', guests.filter((g) => g.openCount > 0).length],
    ['Sẽ đến', yes],
    ['Không đến', no],
    ['Lời chúc', wishes.length],
  ]
  return h('div', { class: 'stats' }, items.map(([label, n]) => h('div', { class: 'stat' }, h('b', { text: n }), h('span', { text: label }))))
}

function dashboard(password, data, settings) {
  const api = createAdminApi(password)
  const state = {
    api,
    data,
    settings, // null = chưa tải được
    content: mergeSettings(baseContent, settings || {}), // nội dung thiệp đã ghép cài đặt
    reload: null,
    refreshHead: null,
  }
  const statsWrap = h('div')
  const panel = h('div', { class: 'panel' })
  const headSub = h('p', { class: 'admin-head__sub' })
  let current = null

  state.refreshHead = () => {
    const date = formatDateDots(eventRange(state.content.event).start)
    headSub.textContent = `${state.content.graduate.fullName} · ${date}`
  }

  const tabs = [
    ['guests', 'Khách mời', renderGuestsTab],
    ['rsvp', 'Xác nhận', renderRsvpTab],
    ['wishes', 'Lời chúc', renderWishesTab],
    ['settings', 'Cài đặt', renderSettingsTab],
  ]
  let active = (() => {
    try {
      return localStorage.getItem(TAB_KEY) || 'guests'
    } catch {
      return 'guests'
    }
  })()
  if (!tabs.some(([id]) => id === active)) active = 'guests'

  const tabBtns = tabs.map(([id, label]) =>
    h('button', {
      class: 'tab',
      text: label,
      attrs: { type: 'button', role: 'tab', 'aria-selected': String(id === active) },
      on: { click: () => show(id) },
    }),
  )

  function show(id) {
    active = id
    try {
      localStorage.setItem(TAB_KEY, id)
    } catch {
      /* bỏ qua */
    }
    tabBtns.forEach((b, i) => b.setAttribute('aria-selected', String(tabs[i][0] === id)))
    const [, , render] = tabs.find(([t]) => t === id)
    current = render(panel, state)
  }

  state.reload = async ({ background = false } = {}) => {
    try {
      const [data, settings] = await Promise.all([api.overview(), fetchSettings(api)])
      state.data = data
      if (settings) {
        state.settings = settings
        state.content = mergeSettings(baseContent, settings)
        state.refreshHead()
      }
      statsWrap.replaceChildren(stats(state.data))
      current?.update({ background })
    } catch (err) {
      if (err.status === 401) return logout('Mật khẩu đã đổi, bạn đăng nhập lại nhé')
      toast(err.message, 'error')
    }
  }

  function logout(message = '') {
    session.set(null)
    document.removeEventListener('visibilitychange', onVisible)
    renderLogin(root, start, message)
  }

  const onVisible = () => !document.hidden && state.reload({ background: true })
  document.addEventListener('visibilitychange', onVisible)

  state.refreshHead()
  root.replaceChildren(
    h('header', { class: 'admin-head' },
      h('div', {},
        h('h1', { class: 'admin-head__title', text: 'Quản lí thiệp mời' }),
        headSub,
      ),
      h('div', { class: 'admin-head__actions' },
        h('a', { class: 'btn btn--ghost btn--small', href: '/', target: '_blank', rel: 'noopener', attrs: { title: 'Xem thiệp chung' }, html: `${icons.eye}<span>Xem thiệp</span>` }),
        h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button', title: 'Làm mới', 'aria-label': 'Làm mới' }, html: icons.refresh, on: { click: () => state.reload().then(() => toast('Đã cập nhật', 'success')) } }),
        h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button', title: 'Đăng xuất', 'aria-label': 'Đăng xuất' }, html: icons.logout, on: { click: () => logout() } }),
      ),
    ),
    statsWrap,
    h('nav', { class: 'tabs', attrs: { role: 'tablist' } }, tabBtns),
    panel,
  )
  statsWrap.replaceChildren(stats(data))
  show(active)
}

async function start(password, data) {
  session.set(password)
  dashboard(password, data, await fetchSettings(createAdminApi(password)))
}

async function boot() {
  const saved = session.get()
  if (!saved) return renderLogin(root, start)
  try {
    const api = createAdminApi(saved)
    const [data, settings] = await Promise.all([api.overview(), fetchSettings(api)])
    dashboard(saved, data, settings)
  } catch (err) {
    session.set(null)
    renderLogin(root, start, err.status === 401 ? '' : err.message)
  }
}

boot()
