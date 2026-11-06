import { RESERVED_SLUGS } from '../../shared/constants.js'

/** "/tien-quoc?xem-thu=1" → { slug: 'tien-quoc', preview: true } */
export function parseRoute({ pathname, search }) {
  const preview = new URLSearchParams(search).get('xem-thu') === '1'
  let first = String(pathname || '').replace(/^\/+/, '').split('/')[0]
  try {
    first = decodeURIComponent(first).toLowerCase()
  } catch {
    first = ''
  }
  const valid = /^[a-z0-9-]{1,40}$/.test(first) && !RESERVED_SLUGS.includes(first)
  return { slug: valid ? first : null, preview }
}
