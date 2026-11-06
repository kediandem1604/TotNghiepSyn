import { test, expect, beforeEach } from 'vitest'
import { createRouter } from '../server/router.js'
import { createMemoryStore } from '../server/store/memory.js'
import { call, T0 } from './helpers.js'

const auth = { authorization: 'Bearer bi-mat' }
let store, r

beforeEach(() => {
  store = createMemoryStore()
  r = createRouter({ store, adminPassword: 'bi-mat', now: () => new Date(T0) })
})

test('thiếu/sai mật khẩu, chưa đặt mật khẩu', async () => {
  expect((await call(r, 'GET', '/api/admin/overview')).status).toBe(401)
  expect((await call(r, 'GET', '/api/admin/overview', null, { authorization: 'Bearer x' })).status).toBe(401)
  expect((await call(r, 'GET', '/api/admin/overview', null, { authorization: 'bi-mat' })).status).toBe(401)
  const r2 = createRouter({ store: createMemoryStore(), adminPassword: '' })
  const res = await call(r2, 'GET', '/api/admin/overview', null, auth)
  expect(res.status).toBe(503)
  expect(res.body.error).toBe('Chưa đặt mật khẩu quản lí')
})

test('mật khẩu có dấu tiếng Việt (trình duyệt gửi dạng mã hoá URL)', async () => {
  const r2 = createRouter({ store: createMemoryStore(), adminPassword: 'Thắm 2026' })
  const bearer = (p) => ({ authorization: `Bearer ${encodeURIComponent(p)}` })
  expect((await call(r2, 'GET', '/api/admin/overview', null, bearer('Thắm 2026'))).status).toBe(200)
  expect((await call(r2, 'GET', '/api/admin/overview', null, bearer('Tham 2026'))).status).toBe(401)
  expect((await call(r2, 'GET', '/api/admin/overview', null, { authorization: 'Bearer %E0%A4%A' })).status).toBe(401)
})

test('thêm hàng loạt: tên trùng nhau và trùng khách cũ ra slug khác nhau', async () => {
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Minh Anh' }] }, auth)
  const res = await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Minh Anh', title: 'Chị' }, { name: 'minh anh' }] }, auth)
  expect(res.status).toBe(201)
  expect(res.body.created.map((g) => g.slug)).toEqual(['minh-anh-2', 'minh-anh-3'])
  expect(res.body.created[0]).toMatchObject({
    name: 'Minh Anh',
    title: 'Chị',
    note: '',
    createdAt: T0,
    openCount: 0,
    firstOpenedAt: null,
    lastOpenedAt: null,
    rsvp: null,
  })
})

test('thêm khách không hợp lệ', async () => {
  expect((await call(r, 'POST', '/api/admin/guests', { guests: [] }, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', {}, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', { guests: [{ name: '' }] }, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'A', title: 'x'.repeat(21) }] }, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', { guests: Array(201).fill({ name: 'A' }) }, auth)).status).toBe(400)
  // Một dòng lỗi thì không tạo ai cả
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Hợp lệ' }, { name: '' }] }, auth)
  expect((await call(r, 'GET', '/api/admin/overview', null, auth)).body.guests).toHaveLength(0)
})

test('sửa giữ nguyên slug, xoá khách, xoá lời chúc', async () => {
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Vy' }] }, auth)
  const p = await call(r, 'PATCH', '/api/admin/guests/vy', { name: 'Tường Vy', title: 'Em', note: 'Nhớ đến nha' }, auth)
  expect(p.body).toMatchObject({ slug: 'vy', name: 'Tường Vy', title: 'Em', note: 'Nhớ đến nha' })
  expect((await call(r, 'GET', '/api/guests/vy')).body.name).toBe('Tường Vy')
  expect((await call(r, 'DELETE', '/api/admin/guests/vy', null, auth)).status).toBe(204)
  expect((await call(r, 'GET', '/api/guests/vy')).status).toBe(404)
  expect((await call(r, 'PATCH', '/api/admin/guests/vy', { name: 'X' }, auth)).status).toBe(404)
  expect((await call(r, 'DELETE', '/api/admin/guests/vy', null, auth)).status).toBe(404)
  const w = await call(r, 'POST', '/api/wishes', { name: 'A', message: 'hi', emoji: '🎓' })
  expect((await call(r, 'DELETE', `/api/admin/wishes/${w.body.id}`, null, auth)).status).toBe(204)
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(0)
  expect((await call(r, 'DELETE', '/api/admin/wishes/khongco', null, auth)).status).toBe(404)
})

test('sửa chỉ một phần giữ nguyên các trường khác', async () => {
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Vy', title: 'Em', note: 'a' }] }, auth)
  const p = await call(r, 'PATCH', '/api/admin/guests/vy', { note: 'b' }, auth)
  expect(p.body).toMatchObject({ name: 'Vy', title: 'Em', note: 'b' })
})

test('overview trả đủ dữ liệu, lời chúc có slug', async () => {
  await call(r, 'POST', '/api/wishes', { name: 'A', message: 'hi', emoji: '🎓', slug: 'vy' })
  const o = await call(r, 'GET', '/api/admin/overview', null, auth)
  expect(Object.keys(o.body).sort()).toEqual(['guests', 'reactions', 'rsvps', 'wishes'])
  expect(o.body.wishes[0].slug).toBe('vy')
  expect(o.body.reactions.tim).toBe(0)
})
