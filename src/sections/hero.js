import { h } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { eventRange } from '../lib/time.js'
import { escapeHtml } from '../lib/text.js'

/** Hình minh hoạ khi chưa có ảnh: trời, mây, mũ tốt nghiệp và chữ lồng. */
function illustration(shortName) {
  return `<svg viewBox="0 0 240 320" class="hero__art" role="img" aria-label="Minh hoạ mũ tốt nghiệp giữa bầu trời">
    <defs>
      <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fcdfb"/><stop offset=".65" stop-color="#d4ecff"/><stop offset="1" stop-color="#fff4ea"/></linearGradient>
      <radialGradient id="hsun"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="240" height="320" fill="url(#hs)"/>
    <circle cx="180" cy="70" r="70" fill="url(#hsun)"/>
    <g fill="#fff" opacity=".9"><circle cx="40" cy="250" r="26"/><circle cx="72" cy="238" r="32"/><circle cx="104" cy="252" r="24"/><rect x="18" y="250" width="110" height="26" rx="13"/></g>
    <g fill="#fff" opacity=".75"><circle cx="170" cy="200" r="16"/><circle cx="192" cy="192" r="20"/><circle cx="212" cy="204" r="14"/><rect x="156" y="202" width="70" height="16" rx="8"/></g>
    <g class="hero__art-cap" transform="translate(120 128) rotate(-8)">
      <path d="M0-30 58-4 0 22-58-4z" fill="#13304f"/>
      <path d="M-34 6v20c0 8 15 15 34 15s34-7 34-15V6L0 22z" fill="#21497a"/>
      <path d="M50 0v30" stroke="#f2c46d" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="34" r="5" fill="#f2c46d"/><circle cx="0" cy="-4" r="4" fill="#f2c46d"/>
    </g>
    <text x="120" y="222" text-anchor="middle" font-family="Great Vibes, cursive" font-size="44" fill="#2378c2">${escapeHtml(shortName)}</text>
  </svg>`
}

export function renderHero(root, ctx) {
  const { graduate, photos, texts } = ctx.content
  const year = eventRange(ctx.content.event).start.getUTCFullYear()

  const frameInner = photos.hero
    ? h('img', { src: photos.hero, alt: `Ảnh ${graduate.fullName}`, attrs: { decoding: 'async', fetchpriority: 'high' } })
    : h('div', { class: 'hero__art-wrap', html: illustration(graduate.shortName) })

  const sparkles = [0, 1, 2, 3].map((i) => h('span', { class: `hero__spark hero__spark--${i}`, attrs: { 'aria-hidden': 'true' }, text: '✦' }))

  const words = graduate.fullName.split(/\s+/).filter(Boolean)
  const name = h(
    'h1',
    { class: 'hero__name script', attrs: { 'aria-label': graduate.fullName } },
    words.map((w, i) => h('span', { class: 'hero__word', style: { '--i': i }, attrs: { 'aria-hidden': 'true' }, text: w })),
  )

  const meta = [graduate.degree, graduate.major].filter(Boolean).join(' · ')

  // Trình phát bài hát (Spotify) ngay dưới tên.
  const songTitle = ctx.content.music?.title
  const player = ctx.music?.slot ? h('div', { class: 'hero__player' }) : null
  const song = player
    ? h('div', { class: 'hero__song' },
        h('p', { class: 'hero__song-lead', text: songTitle ? `🎧 ${graduate.shortName} gửi bạn bài “${songTitle}”` : `🎧 ${graduate.shortName} gửi bạn một bài hát` }),
        player,
      )
    : null

  root.append(
    h('div', { class: 'hero' },
      h('p', { class: 'eyebrow hero__eyebrow', text: `Lễ tốt nghiệp · ${year}` }),
      h('div', { class: 'hero__frame' }, h('div', { class: 'hero__photo' }, frameInner), ...sparkles),
      name,
      meta || graduate.school
        ? h('p', { class: 'hero__meta' }, meta ? h('span', { text: meta }) : null, graduate.school ? h('span', { text: graduate.school }) : null)
        : null,
      texts.heroQuote ? h('p', { class: 'hero__quote', text: texts.heroQuote }) : null,
      song,
      h('a', { class: 'hero__cue', href: '#s-invite', attrs: { 'aria-label': 'Cuộn xuống xem thiệp' } },
        h('span', { text: 'Cuộn xuống' }),
        h('span', { class: 'hero__cue-icon', html: icons.arrowDown }),
      ),
    ),
  )

  if (player) ctx.music.attach(player, { height: 80 })
  ctx.onOpen(() => root.classList.add('is-live'))
}
