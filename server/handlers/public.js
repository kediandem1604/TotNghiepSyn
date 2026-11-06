import { HttpError, json, noContent, readJson } from '../http.js'
import { cleanText } from '../validate.js'
import { update } from '../store/update.js'
import { LIMITS, REACTION_KEYS, WISH_EMOJIS } from '../../shared/constants.js'

export const EMPTY = {
  guests: { guests: [] },
  rsvps: { rsvps: [] },
  wishes: { wishes: [] },
  reactions: { counts: {} },
  config: { settings: {} },
}

const NOT_FOUND_GUEST = 'Không tìm thấy khách mời'

export async function load(store, key) {
  const item = await store.get(key)
  return item ? item.data : structuredClone(EMPTY[key])
}

export function fullCounts(counts = {}) {
  return Object.fromEntries(REACTION_KEYS.map((k) => [k, counts[k] || 0]))
}

const publicWish = ({ slug, ...wish }) => wish

function findGuest(data, slug) {
  const g = data.guests.find((x) => x.slug === slug)
  if (!g) throw new HttpError(404, NOT_FOUND_GUEST)
  return g
}

export function publicRoutes({ store, now, randomId }) {
  const stamp = () => now().toISOString()

  return [
    // Cài đặt thiệp do trang quản lí lưu (giờ, địa điểm…); chưa lưu → {}.
    ['GET', /^\/config$/, async () => json(200, { settings: (await load(store, 'config')).settings })],

    ['GET', /^\/guests\/([a-z0-9-]+)$/, async (req, [slug]) => {
      const g = findGuest(await load(store, 'guests'), slug)
      return json(200, { name: g.name, title: g.title, note: g.note, rsvp: g.rsvp })
    }],

    ['POST', /^\/guests\/([a-z0-9-]+)\/opened$/, async (req, [slug]) => {
      const at = stamp()
      await update(store, 'guests', (data) => {
        const g = findGuest(data, slug)
        g.openCount = (g.openCount || 0) + 1
        g.firstOpenedAt ||= at
        g.lastOpenedAt = at
        return data
      }, EMPTY.guests)
      return noContent()
    }],

    ['POST', /^\/rsvp$/, async (req) => {
      const body = await readJson(req, LIMITS.maxBody)
      if (typeof body.attending !== 'boolean') throw new HttpError(400, 'Bạn chọn có đến hay không nhé')
      const at = stamp()
      if (typeof body.slug === 'string' && body.slug) {
        await update(store, 'guests', (data) => {
          findGuest(data, body.slug).rsvp = { attending: body.attending, at }
          return data
        }, EMPTY.guests)
        return json(200, { ok: true })
      }
      const name = cleanText(body.name, { label: 'Tên', min: 1, max: LIMITS.wishName })
      let id = typeof body.id === 'string' ? body.id.slice(0, 20) : ''
      await update(store, 'rsvps', (data) => {
        const existing = id && data.rsvps.find((x) => x.id === id)
        if (existing) Object.assign(existing, { name, attending: body.attending, at })
        else {
          id = randomId()
          data.rsvps.unshift({ id, name, attending: body.attending, at })
        }
        return data
      }, EMPTY.rsvps)
      return json(200, { ok: true, id })
    }],

    ['GET', /^\/wishes$/, async () => {
      const [wishes, reactions] = await Promise.all([load(store, 'wishes'), load(store, 'reactions')])
      return json(200, { wishes: wishes.wishes.map(publicWish), reactions: fullCounts(reactions.counts) })
    }],

    ['POST', /^\/wishes$/, async (req) => {
      const body = await readJson(req, LIMITS.maxBody)
      const emoji = body.emoji ?? WISH_EMOJIS[0]
      if (body.website) {
        // Ô bẫy bot có chữ: giả vờ thành công, không lưu.
        return json(201, { id: randomId(), name: String(body.name ?? ''), message: String(body.message ?? ''), emoji, at: stamp() })
      }
      const wish = {
        id: randomId(),
        name: cleanText(body.name, { label: 'Tên', min: 1, max: LIMITS.wishName }),
        message: cleanText(body.message, { label: 'Lời chúc', min: 1, max: LIMITS.wishMessage, multiline: true }),
        emoji,
        slug: typeof body.slug === 'string' ? body.slug.slice(0, 40) : null,
        at: stamp(),
      }
      if (!WISH_EMOJIS.includes(emoji)) throw new HttpError(400, 'Cảm xúc không hợp lệ')
      await update(store, 'wishes', (data) => {
        data.wishes.unshift(wish)
        data.wishes.length = Math.min(data.wishes.length, LIMITS.maxWishes)
        return data
      }, EMPTY.wishes)
      return json(201, publicWish(wish))
    }],

    ['POST', /^\/reactions$/, async (req) => {
      const body = await readJson(req, LIMITS.maxBody)
      const counts = body.counts
      if (!counts || typeof counts !== 'object' || Array.isArray(counts)) throw new HttpError(400, 'Dữ liệu không hợp lệ')
      for (const [k, v] of Object.entries(counts)) {
        if (!REACTION_KEYS.includes(k) || !Number.isInteger(v) || v < 0 || v > LIMITS.reactionPerRequest) {
          throw new HttpError(400, 'Cảm xúc không hợp lệ')
        }
      }
      const data = await update(store, 'reactions', (d) => {
        for (const [k, v] of Object.entries(counts)) d.counts[k] = (d.counts[k] || 0) + v
        return d
      }, EMPTY.reactions)
      return json(200, { counts: fullCounts(data.counts) })
    }],
  ]
}
