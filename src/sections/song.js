import { h, sectionHead } from '../lib/dom.js'

/** Phần "Giai điệu": trình phát Spotify (chỉ hiện khi nhạc lấy từ Spotify). */
export function renderSong(root, ctx) {
  const music = ctx.music
  if (!music?.slot) {
    root.hidden = true
    return
  }
  const { graduate, music: info } = ctx.content
  const holder = h('div', { class: 'song__player' })
  root.append(
    sectionHead('Giai điệu', 'Bài hát của ngày vui'),
    h('div', { class: 'card song', attrs: { 'data-reveal': '' } },
      h('p', { class: 'song__lead', text: info.title ? `${graduate.shortName} gửi bạn bài “${info.title}” 🎧` : `${graduate.shortName} gửi bạn một bài hát 🎧` }),
      holder,
      h('p', { class: 'song__hint muted', text: 'Bấm ▶ để nghe, hoặc bấm nút đĩa nhạc ở góc màn hình.' }),
    ),
  )
  music.attach(holder)
}
