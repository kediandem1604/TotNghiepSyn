import { createHash, timingSafeEqual } from 'node:crypto'
import { HttpError, json, noContent, readJson } from '../http.js'
import { cleanText } from '../validate.js'
import { validateSettings } from '../settings.js'
import { update } from '../store/update.js'
import { EMPTY, load, fullCounts } from './public.js'
import { uniqueSlug } from '../../shared/slug.js'
import { LIMITS } from '../../shared/constants.js'

const sha = (s) => createHash('sha256').update(String(s)).digest()

function requireAdmin(req, adminPassword) {
  if (!adminPassword) throw new HttpError(503, 'Chưa đặt mật khẩu quản lí')
  const header = req.headers.get('authorization') || ''
  // Trình duyệt gửi mật khẩu dạng mã hoá URL (header chỉ nhận ký tự Latin-1,
  // nên mật khẩu có dấu tiếng Việt phải mã hoá mới gửi được).
  let given = header.startsWith('Bearer ') ? header.slice(7) : null
  if (given !== null) {
    try {
      given = decodeURIComponent(given)
    } catch {
      /* chuỗi mã hoá hỏng: so sánh nguyên văn (sẽ sai mật khẩu) */
    }
  }
  // So sánh băm SHA-256 để thời gian so sánh không lộ độ dài/mật khẩu.
  if (given === null || !timingSafeEqual(sha(given), sha(adminPassword))) {
    throw new HttpError(401, 'Sai mật khẩu')
  }
}

const cleanName = (v) => cleanText(v, { label: 'Tên khách', min: 1, max: LIMITS.guestName })
const cleanTitle = (v) => cleanText(v, { label: 'Xưng hô', max: LIMITS.title })
const cleanNote = (v) => cleanText(v, { label: 'Lời nhắn', max: LIMITS.note, multiline: true })

export function adminRoutes({ store, adminPassword, now }) {
  const guarded = (handler) => async (req, params) => {
    requireAdmin(req, adminPassword)
    return handler(req, params)
  }

  return [
    ['GET', /^\/admin\/overview$/, guarded(async () => {
      const [guests, rsvps, wishes, reactions] = await Promise.all(
        ['guests', 'rsvps', 'wishes', 'reactions'].map((k) => load(store, k)),
      )
      return json(200, {
        guests: guests.guests,
        rsvps: rsvps.rsvps,
        wishes: wishes.wishes,
        reactions: fullCounts(reactions.counts),
      })
    })],

    ['POST', /^\/admin\/guests$/, guarded(async (req) => {
      const body = await readJson(req, LIMITS.maxBody)
      const list = body.guests
      if (!Array.isArray(list) || list.length < 1 || list.length > LIMITS.bulkMax) {
        throw new HttpError(400, `Mỗi lần thêm từ 1 đến ${LIMITS.bulkMax} khách`)
      }
      const inputs = list.map((g) => ({
        name: cleanName(g?.name),
        title: cleanTitle(g?.title),
        note: cleanNote(g?.note),
      }))
      const createdAt = now().toISOString()
      let created = []
      await update(store, 'guests', (data) => {
        const taken = new Set(data.guests.map((g) => g.slug))
        created = inputs.map((input) => {
          const slug = uniqueSlug(input.name, taken)
          taken.add(slug)
          return { slug, ...input, createdAt, openCount: 0, firstOpenedAt: null, lastOpenedAt: null, rsvp: null }
        })
        data.guests.push(...created)
        return data
      }, EMPTY.guests)
      return json(201, { created })
    })],

    ['PATCH', /^\/admin\/guests\/([a-z0-9-]+)$/, guarded(async (req, [slug]) => {
      const body = await readJson(req, LIMITS.maxBody)
      const patch = {}
      if ('name' in body) patch.name = cleanName(body.name)
      if ('title' in body) patch.title = cleanTitle(body.title)
      if ('note' in body) patch.note = cleanNote(body.note)
      let updated
      await update(store, 'guests', (data) => {
        const g = data.guests.find((x) => x.slug === slug)
        if (!g) throw new HttpError(404, 'Không tìm thấy khách mời')
        Object.assign(g, patch)
        updated = g
        return data
      }, EMPTY.guests)
      return json(200, updated)
    })],

    ['DELETE', /^\/admin\/guests\/([a-z0-9-]+)$/, guarded(async (req, [slug]) => {
      await update(store, 'guests', (data) => {
        const i = data.guests.findIndex((x) => x.slug === slug)
        if (i < 0) throw new HttpError(404, 'Không tìm thấy khách mời')
        data.guests.splice(i, 1)
        return data
      }, EMPTY.guests)
      return noContent()
    })],

    ['DELETE', /^\/admin\/wishes\/([A-Za-z0-9_-]+)$/, guarded(async (req, [id]) => {
      await update(store, 'wishes', (data) => {
        const i = data.wishes.findIndex((x) => x.id === id)
        if (i < 0) throw new HttpError(404, 'Không tìm thấy lời chúc')
        data.wishes.splice(i, 1)
        return data
      }, EMPTY.wishes)
      return noContent()
    })],

    // Cài đặt thiệp (tab "Cài đặt"): lưu đủ các ô, kiểm tra trước khi ghi.
    ['PUT', /^\/admin\/config$/, guarded(async (req) => {
      const body = await readJson(req, LIMITS.maxBody)
      const settings = validateSettings(body.settings)
      const updatedAt = now().toISOString()
      await update(store, 'config', () => ({ settings, updatedAt }), EMPTY.config)
      return json(200, { settings })
    })],

    // Khôi phục mặc định: ghi cài đặt rỗng → thiệp dùng lại content.js.
    ['DELETE', /^\/admin\/config$/, guarded(async () => {
      const updatedAt = now().toISOString()
      await update(store, 'config', () => ({ settings: {}, updatedAt }), EMPTY.config)
      return noContent()
    })],
  ]
}
