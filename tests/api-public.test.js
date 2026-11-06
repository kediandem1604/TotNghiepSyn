import { test, expect, beforeEach } from 'vitest'
import { createRouter } from '../server/router.js'
import { createMemoryStore } from '../server/store/memory.js'
import { call, T0, guest } from './helpers.js'

let store, r

beforeEach(async () => {
  store = createMemoryStore()
  await store.set('guests', { guests: [guest()] }, { etag: null })
  let n = 0
  r = createRouter({ store, adminPassword: 'bi-mat', now: () => new Date(T0), randomId: () => `id${++n}` })
})

test('GET khách có/không tồn tại', async () => {
  expect(await call(r, 'GET', '/api/guests/tien-quoc')).toMatchObject({
    status: 200,
    body: { name: 'Tiến Quốc', title: 'Anh', note: '', rsvp: null },
  })
  expect((await call(r, 'GET', '/api/guests/khong-co')).status).toBe(404)
})

test('GET khách không lộ số lần mở', async () => {
  const { body } = await call(r, 'GET', '/api/guests/tien-quoc')
  expect(body).not.toHaveProperty('openCount')
})

test('ghi nhận mở thiệp', async () => {
  expect((await call(r, 'POST', '/api/guests/tien-quoc/opened')).status).toBe(204)
  await call(r, 'POST', '/api/guests/tien-quoc/opened')
  const g = (await store.get('guests')).data.guests[0]
  expect(g.openCount).toBe(2)
  expect(g.firstOpenedAt).toBe(T0)
  expect(g.lastOpenedAt).toBe(T0)
  expect((await call(r, 'POST', '/api/guests/khong-co/opened')).status).toBe(404)
})

test('rsvp theo slug và theo tên', async () => {
  expect((await call(r, 'POST', '/api/rsvp', { slug: 'tien-quoc', attending: true })).status).toBe(200)
  expect((await store.get('guests')).data.guests[0].rsvp).toEqual({ attending: true, at: T0 })
  expect((await call(r, 'POST', '/api/rsvp', { name: 'Bé Na', attending: false })).status).toBe(200)
  expect((await store.get('rsvps')).data.rsvps[0]).toMatchObject({ name: 'Bé Na', attending: false, at: T0 })
  expect((await call(r, 'POST', '/api/rsvp', { attending: true })).status).toBe(400)
  expect((await call(r, 'POST', '/api/rsvp', { slug: 'tien-quoc', attending: 'có' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/rsvp', { slug: 'khong-co', attending: true })).status).toBe(404)
})

test('rsvp link chung: gửi lại kèm id thì sửa, không tạo bản trùng', async () => {
  const first = await call(r, 'POST', '/api/rsvp', { name: 'Bé Na', attending: true })
  await call(r, 'POST', '/api/rsvp', { name: 'Bé Na', attending: false, id: first.body.id })
  const { rsvps } = (await store.get('rsvps')).data
  expect(rsvps).toHaveLength(1)
  expect(rsvps[0].attending).toBe(false)
})

test('gửi lời chúc: giữ HTML dạng chữ, giữ xuống dòng, bỏ ký tự điều khiển', async () => {
  const res = await call(r, 'POST', '/api/wishes', {
    name: ' Minh Trí ',
    message: '<b>Chúc</b>\u0007 mừng\nnha',
    emoji: '🎉',
    slug: 'tien-quoc',
  })
  expect(res.status).toBe(201)
  expect(res.body).toMatchObject({ id: 'id1', name: 'Minh Trí', message: '<b>Chúc</b> mừng\nnha', emoji: '🎉', at: T0 })
  const list = await call(r, 'GET', '/api/wishes')
  expect(list.body.wishes[0]).not.toHaveProperty('slug')
  expect(list.body.reactions).toEqual({ tim: 0, phao: 0, votay: 0, xucdong: 0, mu: 0, hoa: 0 })
})

test('lời chúc không hợp lệ', async () => {
  expect((await call(r, 'POST', '/api/wishes', { name: '', message: 'x', emoji: '🎓' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: '   ', emoji: '🎓' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x'.repeat(501), emoji: '🎓' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x', emoji: '💩' })).status).toBe(400)
  const bad = await call(r, 'POST', '/api/wishes', { name: 'A'.repeat(41), message: 'x', emoji: '🎓' })
  expect(bad.body.error).toMatch(/Tên/)
})

test('ô bẫy bot: trả 201 nhưng không lưu', async () => {
  const res = await call(r, 'POST', '/api/wishes', { name: 'Bot', message: 'spam', emoji: '🎓', website: 'x' })
  expect(res.status).toBe(201)
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(0)
})

test('lời chúc gửi đồng thời đều được lưu, mới nhất trước', async () => {
  await Promise.all(['A', 'B', 'C'].map((n) => call(r, 'POST', '/api/wishes', { name: n, message: 'hi', emoji: '🎓' })))
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(3)
  await call(r, 'POST', '/api/wishes', { name: 'Mới', message: 'hi', emoji: '🎓' })
  expect((await call(r, 'GET', '/api/wishes')).body.wishes[0].name).toBe('Mới')
})

test('cảm xúc: cộng dồn, chặn quá 60 và khoá lạ', async () => {
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: 3, mu: 1 } })).body.counts).toMatchObject({ tim: 3, mu: 1 })
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: 2 } })).body.counts.tim).toBe(5)
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: 61 } })).status).toBe(400)
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: -1 } })).status).toBe(400)
  expect((await call(r, 'POST', '/api/reactions', { counts: { la: 1 } })).status).toBe(400)
})

test('body quá 20KB → 413; JSON hỏng → 400; route lạ → 404; tiền tố Netlify', async () => {
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x'.repeat(21000), emoji: '🎓' })).status).toBe(413)
  expect((await call(r, 'POST', '/api/wishes', '{hỏng')).status).toBe(400)
  expect((await call(r, 'GET', '/api/khong-co')).status).toBe(404)
  expect((await call(r, 'GET', '/.netlify/functions/api/wishes')).status).toBe(200)
})
