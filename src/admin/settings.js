import baseContent from '../../content.js'
import { h, toast } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { SETTINGS_GROUPS, pickSettings, mergeSettings, getPath, setPath } from '../../shared/settings.js'

const INPUT_TYPES = { date: 'date', time: 'time', url: 'url', youtube: 'url', spotify: 'url', phone: 'tel' }
// Ô dài chiếm cả hàng; ô ngắn (ngày, giờ, tên, số điện thoại…) xếp cạnh nhau.
const isWide = (f) => f.kind === 'multiline' || INPUT_TYPES[f.kind] === 'url' || (f.max || 0) > 100

/** Tab "Cài đặt": sửa giờ, địa điểm, tên, lời văn, nhạc, liên hệ của thiệp. */
export function renderSettingsTab(root, state) {
  const inputs = new Map() // path → ô nhập
  let dirty = false // đang sửa dở → không tự làm mới đè lên

  function field(f) {
    const id = `cfg-${f.path.replace('.', '-')}`
    const el =
      f.kind === 'multiline'
        ? h('textarea', { class: 'field', attrs: { id, rows: f.path === 'texts.shareTemplate' ? '3' : '4' } })
        : h('input', { class: 'field', type: INPUT_TYPES[f.kind] || 'text', attrs: { id } })
    if (f.max) el.maxLength = f.max
    inputs.set(f.path, el)
    return h('div', { class: `cfg-field${isWide(f) ? ' cfg-field--wide' : ''}` },
      h('label', { class: 'cfg-label', attrs: { for: id }, text: f.required ? `${f.label} *` : f.label }),
      el,
      f.hint ? h('small', { class: 'muted cfg-hint', text: f.hint }) : null,
    )
  }

  function fill(values) {
    for (const [path, el] of inputs) el.value = getPath(values, path) ?? ''
    dirty = false
  }

  function collect() {
    const settings = {}
    for (const [path, el] of inputs) setPath(settings, path, el.value)
    return settings
  }

  function applySaved(settings) {
    state.settings = settings
    state.content = mergeSettings(baseContent, settings)
    state.refreshHead()
    fill(pickSettings(state.content))
  }

  const save = h('button', { class: 'btn btn--primary', attrs: { type: 'submit' }, html: `${icons.check}<span>Lưu</span>` })
  const reset = h('button', {
    class: 'btn btn--ghost',
    attrs: { type: 'button' },
    text: 'Khôi phục mặc định',
    on: {
      async click() {
        if (!window.confirm('Đưa mọi cài đặt về như ban đầu?')) return
        reset.disabled = true
        try {
          await state.api.resetConfig()
          applySaved({})
          toast('Đã khôi phục mặc định', 'success')
        } catch (err) {
          toast(err.message, 'error')
        } finally {
          reset.disabled = false
        }
      },
    },
  })

  // novalidate: để máy chủ báo lỗi bằng tiếng Việt thay cho thông báo của trình duyệt.
  const form = h('form', { class: 'cfg', attrs: { novalidate: true } },
    h('p', { class: 'muted cfg-intro', text: 'Sửa xong bấm Lưu, khách mở thiệp sẽ thấy ngay. Ô có dấu * là bắt buộc; ô để trống thì phần đó trên thiệp tự ẩn.' }),
    SETTINGS_GROUPS.map((g) =>
      h('fieldset', { class: 'card cfg-group' },
        h('legend', { class: 'card-title cfg-legend', text: g.title }),
        // File mp3 (đặt trong content.js) luôn được ưu tiên hơn link YouTube/Spotify.
        g.fields.some((f) => f.path === 'music.youtube') && baseContent.music?.src
          ? h('p', { class: 'cfg-note', text: '🎵 Thiệp đang phát file nhạc riêng (mp3), nên hai ô link YouTube và Spotify tạm thời không được dùng.' })
          : null,
        h('div', { class: 'cfg-grid' }, g.fields.map(field)),
      ),
    ),
    h('div', { class: 'cfg-actions' }, reset, save),
  )
  form.addEventListener('input', () => {
    dirty = true
  })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    save.disabled = true
    try {
      const res = await state.api.saveConfig(collect())
      applySaved(res.settings)
      toast('Đã lưu, khách mở thiệp sẽ thấy ngay', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      save.disabled = false
    }
  })

  const failed = h('section', { class: 'card' },
    h('p', { class: 'empty', text: 'Chưa tải được cài đặt hiện tại. Bấm nút làm mới ↻ ở trên để thử lại.' }),
  )

  function paint() {
    if (state.settings === null) return root.replaceChildren(failed)
    fill(pickSettings(state.content))
    root.replaceChildren(form)
  }

  paint()
  return {
    // Đang sửa dở thì không làm mới (kể cả khi quay lại tab), tránh mất chữ đang gõ.
    update() {
      if (!dirty) paint()
    },
  }
}
