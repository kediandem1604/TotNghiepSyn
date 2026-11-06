import { h } from '../lib/dom.js'
import { capSvg } from '../lib/icons.js'
import { createAdminApi } from '../lib/api.js'

/** Màn đăng nhập. onSuccess(password, overviewData) khi mật khẩu đúng. */
export function renderLogin(root, onSuccess, message = '') {
  const input = h('input', {
    class: 'field',
    type: 'password',
    placeholder: 'Mật khẩu quản lí',
    attrs: { 'aria-label': 'Mật khẩu quản lí', autocomplete: 'current-password', autofocus: true },
  })
  const error = h('p', { class: 'login__error', attrs: { role: 'alert' }, text: message })
  const btn = h('button', { class: 'btn btn--primary', attrs: { type: 'submit' }, text: 'Vào trang quản lí' })

  const form = h('form', { class: 'card login' },
    h('div', { class: 'login__icon', html: capSvg(44, '#2378c2') }),
    h('h1', { class: 'login__title', text: 'Quản lí thiệp mời' }),
    h('p', { class: 'muted login__sub', text: 'Nhập mật khẩu để tạo link mời và xem lời chúc' }),
    input,
    error,
    btn,
  )

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = input.value
    if (!password) return input.focus()
    btn.disabled = true
    error.textContent = ''
    try {
      const data = await createAdminApi(password).overview()
      onSuccess(password, data)
    } catch (err) {
      error.textContent = err.status === 401 ? 'Sai mật khẩu, bạn thử lại nhé' : err.message
      input.select()
    } finally {
      btn.disabled = false
    }
  })

  root.replaceChildren(h('div', { class: 'login-wrap' }, form))
  input.focus()
}
