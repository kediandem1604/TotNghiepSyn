import { h } from '../lib/dom.js'
import { planeSvg } from '../lib/icons.js'
import { eventRange, formatDateDots } from '../lib/time.js'

export function renderClosing(root, ctx) {
  const { texts, graduate, event } = ctx.content
  const date = formatDateDots(eventRange(event).start).slice(0, 5)
  const [lead, ...rest] = String(texts.closing || '').split('\n')

  root.append(
    h('div', { class: 'closing', attrs: { 'data-reveal': '' } },
      h('div', { class: 'closing__planes', attrs: { 'aria-hidden': 'true' } },
        [0, 1, 2].map((i) => h('span', { class: `closing__plane closing__plane--${i}`, html: planeSvg(i === 1 ? 54 : 38) })),
      ),
      h('p', { class: 'closing__lead', text: lead }),
      rest.length ? h('p', { class: 'closing__text', text: rest.join('\n') }) : null,
      h('p', { class: 'closing__sign script', text: graduate.shortName }),
      h('p', { class: 'closing__see', text: `Hẹn gặp ${ctx.displayName} ngày ${date} 💙` }),
    ),
    h('footer', { class: 'footer', text: `Thiệp mời tốt nghiệp · ${graduate.fullName}` }),
  )
}
