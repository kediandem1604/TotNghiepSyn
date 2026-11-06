import { h } from '../lib/dom.js'

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function renderInvite(root, ctx) {
  const { texts, graduate } = ctx.content
  const note = ctx.guest?.note

  root.append(
    h('div', { class: 'card invite', attrs: { 'data-reveal': '' } },
      h('p', { class: 'eyebrow', text: texts.inviteLead }),
      h('p', { class: 'invite__guest script', text: capitalize(ctx.displayName) }),
      h('p', { class: 'invite__body', text: texts.inviteBody }),
      note
        ? h('figure', { class: 'note', attrs: { 'data-reveal': '' }, style: { '--i': 2 } },
            h('span', { class: 'note__tape', attrs: { 'aria-hidden': 'true' } }),
            h('figcaption', { class: 'note__label', text: `Lời nhắn riêng từ ${graduate.shortName}` }),
            h('p', { class: 'note__text', text: note }),
          )
        : null,
      h('p', { class: 'invite__sign script', text: graduate.shortName }),
    ),
  )
}
