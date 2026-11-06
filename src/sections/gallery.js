import { h, sectionHead } from '../lib/dom.js'
import { icons } from '../lib/icons.js'

function openLightbox(photos, start, name) {
  let index = start
  const img = h('img', { alt: '' })
  const counter = h('span', { class: 'lightbox__count' })
  const show = (i) => {
    index = (i + photos.length) % photos.length
    img.src = photos[index]
    img.alt = `Ảnh ${index + 1} của ${name}`
    counter.textContent = `${index + 1} / ${photos.length}`
  }
  const close = () => {
    box.remove()
    document.removeEventListener('keydown', onKey)
    opener?.focus()
  }
  const onKey = (e) => {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') show(index + 1)
    if (e.key === 'ArrowLeft') show(index - 1)
  }
  const opener = document.activeElement
  const many = photos.length > 1
  const closeBtn = h('button', { class: 'lightbox__btn lightbox__close', attrs: { type: 'button', 'aria-label': 'Đóng' }, html: icons.close, on: { click: close } })
  const box = h('div', { class: 'lightbox', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Xem ảnh' }, on: { click: (e) => e.target === box && close() } },
    img,
    closeBtn,
    many ? h('button', { class: 'lightbox__btn lightbox__prev', attrs: { type: 'button', 'aria-label': 'Ảnh trước' }, html: icons.left, on: { click: () => show(index - 1) } }) : null,
    many ? h('button', { class: 'lightbox__btn lightbox__next', attrs: { type: 'button', 'aria-label': 'Ảnh sau' }, html: icons.right, on: { click: () => show(index + 1) } }) : null,
    many ? counter : null,
  )
  show(start)
  document.body.append(box)
  document.addEventListener('keydown', onKey)
  closeBtn.focus()
}

export function renderGallery(root, ctx) {
  const photos = ctx.content.photos.gallery || []
  if (!photos.length) {
    root.hidden = true
    return
  }
  const name = ctx.content.graduate.shortName
  root.append(
    sectionHead('Khoảnh khắc', 'Thanh xuân rực rỡ'),
    h('div', { class: 'gallery', attrs: { 'data-reveal': '' } },
      photos.map((src, i) =>
        h('button', {
          class: 'polaroid',
          style: { '--i': i, '--tilt': `${i % 2 ? 3 : -3}deg` },
          attrs: { type: 'button', 'aria-label': `Xem ảnh ${i + 1}` },
          on: { click: () => openLightbox(photos, i, name) },
        }, h('img', { src, alt: '', attrs: { loading: 'lazy', decoding: 'async' } })),
      ),
    ),
  )
}
