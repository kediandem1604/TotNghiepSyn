import { h, sectionHead, whenNear } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { mapEmbedUrl } from '../lib/maps.js'

const EMPTY_ART = `<svg viewBox="0 0 160 110" width="150" aria-hidden="true">
  <g fill="#fff"><circle cx="46" cy="78" r="22"/><circle cx="76" cy="68" r="28"/><circle cx="106" cy="80" r="20"/><rect x="26" y="78" width="104" height="22" rx="11"/></g>
  <path d="M80 18c-12 0-21 9-21 20 0 15 21 34 21 34s21-19 21-34c0-11-9-20-21-20z" fill="#5fb6f2"/><circle cx="80" cy="38" r="8" fill="#fff"/>
</svg>`

export function renderVenue(root, ctx) {
  const { venue } = ctx.content
  const query = venue.mapQuery || [venue.name, venue.address].filter(Boolean).join(', ')

  root.append(sectionHead('Địa điểm', 'Hẹn gặp tại'))

  if (!query) {
    root.append(
      h('div', { class: 'card venue venue--empty', attrs: { 'data-reveal': '' } },
        h('div', { html: EMPTY_ART }),
        h('p', { class: 'venue__soon', text: 'Địa điểm sẽ được cập nhật sớm' }),
        h('p', { class: 'muted', text: 'Bạn mở lại thiệp này gần ngày lễ để xem bản đồ nhé.' }),
      ),
    )
    return
  }

  const directions = venue.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
  const map = venue.mapQuery
    ? h('div', { class: 'venue__map', attrs: { 'aria-label': 'Bản đồ địa điểm' } }, h('span', { class: 'venue__map-loading', text: 'Đang tải bản đồ…' }))
    : null

  root.append(
    h('div', { class: 'card venue', attrs: { 'data-reveal': '' } },
      venue.name ? h('p', { class: 'venue__name', text: venue.name }) : null,
      venue.address ? h('p', { class: 'venue__addr' }, h('span', { html: icons.pin }), h('span', { text: venue.address })) : null,
      map,
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn btn--primary', href: directions, attrs: { target: '_blank', rel: 'noopener' }, html: `${icons.route}<span>Chỉ đường</span>` }),
      ),
    ),
  )

  // Chỉ gắn bản đồ khi khách cuộn gần tới để trang tải nhanh.
  if (map) {
    whenNear(map, () => {
      const iframe = h('iframe', {
        src: mapEmbedUrl(venue.mapQuery),
        title: `Bản đồ: ${venue.name || venue.mapQuery}`,
        attrs: { loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allowfullscreen: true },
      })
      iframe.addEventListener('load', () => map.classList.add('is-loaded'))
      map.append(iframe)
    }, '100% 0px')
  }
}
