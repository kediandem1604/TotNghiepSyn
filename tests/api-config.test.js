import { test, expect, beforeEach } from 'vitest'
import { createRouter } from '../server/router.js'
import { createMemoryStore } from '../server/store/memory.js'
import { pickSettings, setPath } from '../shared/settings.js'
import content from '../content.js'
import { call, T0 } from './helpers.js'

const auth = { authorization: 'Bearer bi-mat' }
let r

beforeEach(() => {
  r = createRouter({ store: createMemoryStore(), adminPassword: 'bi-mat', now: () => new Date(T0) })
})

/** Cài đặt hợp lệ (lấy từ content.js), có thể đổi vài ô. */
function valid(changes = {}) {
  const s = pickSettings(content)
  for (const [path, v] of Object.entries(changes)) setPath(s, path, v)
  return s
}

const save = (settings, headers = auth) => call(r, 'PUT', '/api/admin/config', { settings }, headers)

test('chưa lưu lần nào → settings rỗng', async () => {
  expect(await call(r, 'GET', '/api/config')).toEqual({ status: 200, body: { settings: {} } })
})

test('lưu và xoá cần mật khẩu', async () => {
  expect((await save(valid(), {})).status).toBe(401)
  expect((await save(valid(), { authorization: 'Bearer sai' })).status).toBe(401)
  expect((await call(r, 'DELETE', '/api/admin/config')).status).toBe(401)
})

test('lưu rồi đọc lại đúng, giữ dấu, emoji và xuống dòng', async () => {
  const settings = valid({ 'event.start': '14:00', 'event.end': '16:30', 'texts.closing': 'Cảm ơn mọi người 💙\nHẹn gặp nhé' })
  const res = await save(settings)
  expect(res.status).toBe(200)
  expect(res.body.settings.event.start).toBe('14:00')
  const { body } = await call(r, 'GET', '/api/config')
  expect(body.settings.event).toMatchObject({ start: '14:00', end: '16:30' })
  expect(body.settings.texts.closing).toBe('Cảm ơn mọi người 💙\nHẹn gặp nhé')
  expect(body.settings.graduate.fullName).toBe(content.graduate.fullName)
})

test('khoá lạ bị bỏ qua', async () => {
  const settings = { ...valid(), la: { x: 1 } }
  expect((await save(settings)).status).toBe(200)
  const { body } = await call(r, 'GET', '/api/config')
  expect(body.settings.la).toBeUndefined()
})

test.each([
  ['event.date', '2026-02-30', 'Ngày không hợp lệ'],
  ['event.date', '26/11/2026', 'Ngày không hợp lệ'],
  ['event.start', '9:00', 'Giờ bắt đầu không hợp lệ'],
  ['event.end', '09:00', 'Giờ kết thúc phải sau giờ bắt đầu'],
  ['venue.directionsUrl', 'javascript:alert(1)', 'Link chỉ đường phải bắt đầu bằng http:// hoặc https://'],
  ['venue.directionsUrl', 'maps.app.goo.gl/XM9tDsqNQs2nFzrj6', 'Link chỉ đường phải bắt đầu bằng http:// hoặc https://'],
  ['venue.name', 'x'.repeat(151), 'Tên nơi tổ chức tối đa 150 ký tự'],
  ['venue.address', 'x'.repeat(201), 'Địa chỉ tối đa 200 ký tự'],
  ['texts.inviteBody', 'x'.repeat(1001), 'Lời mời — nội dung tối đa 1000 ký tự'],
  ['texts.closing', 'x'.repeat(1001), 'Lời kết tối đa 1000 ký tự'],
  ['event.note', 'x'.repeat(301), 'Ghi chú tối đa 300 ký tự'],
  ['graduate.fullName', 'x'.repeat(61), 'Tên hiển thị tối đa 60 ký tự'],
  ['contact.messenger', 'a'.repeat(301), 'Facebook tối đa 300 ký tự'],
  ['music.youtube', 'https://example.com/x', 'Link YouTube không đúng'],
  ['music.spotify', 'https://example.com/x', 'Link Spotify không đúng'],
  ['contact.phone', '12ab', 'Điện thoại không hợp lệ (8–15 chữ số)'],
  ['contact.zalo', '1234', 'Zalo không hợp lệ (8–15 chữ số)'],
  ['texts.shareTemplate', 'Mời {ten} nhé', 'Mẫu tin nhắn phải có {link} để khách nhận được link thiệp'],
  ['graduate.fullName', '  ', 'Bạn chưa nhập tên hiển thị'],
  ['graduate.shortName', 'x'.repeat(31), 'Tên gọi ngắn tối đa 30 ký tự'],
])('%s = %j → 400 "%s"', async (path, value, message) => {
  const res = await save(valid({ [path]: value }))
  expect(res.status).toBe(400)
  expect(res.body.error).toBe(message)
})

test('body không có settings → 400', async () => {
  expect((await call(r, 'PUT', '/api/admin/config', { x: 1 }, auth)).status).toBe(400)
})

test('các ô được để trống', async () => {
  const res = await save(valid({ 'event.note': '', 'venue.mapQuery': '', 'music.youtube': '', 'contact.phone': '', 'venue.directionsUrl': '' }))
  expect(res.status).toBe(200)
  expect(res.body.settings.venue.mapQuery).toBe('')
})

test('số điện thoại có +, dấu cách, dấu chấm', async () => {
  const res = await save(valid({ 'contact.phone': '+84 901.234.567' }))
  expect(res.status).toBe(200)
})

test.each([
  ['https://www.facebook.com/l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
  ['https://www.facebook.com/share/1ABcd2EfGh/?mibextid=wwXIfr', 'https://www.facebook.com/share/1ABcd2EfGh/'],
  ['https://www.facebook.com/profile.php?id=100012345678', 'https://www.facebook.com/profile.php?id=100012345678'],
  ['l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
])('Facebook dán %j → lưu link trang cá nhân %j', async (input, saved) => {
  const res = await save(valid({ 'contact.messenger': input }))
  expect(res.status).toBe(200)
  expect(res.body.settings.contact.messenger).toBe(saved)
})

test('Facebook không đọc được → 400', async () => {
  const res = await save(valid({ 'contact.messenger': 'Ngọc Thắm' }))
  expect(res.status).toBe(400)
  expect(res.body.error).toBe('Facebook: dán link trang cá nhân hoặc tên người dùng, vd. facebook.com/l.nth.03105')
})

test('ô không gửi lên (tab quản lí cũ chưa có ô mới) → không lưu, thiệp dùng mặc định', async () => {
  const settings = valid()
  delete settings.event.note
  delete settings.music.spotify
  const res = await save(settings)
  expect(res.status).toBe(200)
  const { body } = await call(r, 'GET', '/api/config')
  expect(body.settings.event.note).toBeUndefined()
  expect(body.settings.music.spotify).toBeUndefined()
  expect(body.settings.event.start).toBe(content.event.start)
})

test('ô thiếu vẫn được so với mặc định: giờ bắt đầu sau giờ kết thúc mặc định → 400', async () => {
  const settings = valid({ 'event.start': '13:00' })
  delete settings.event.end // mặc định 12:00
  const res = await save(settings)
  expect(res.status).toBe(400)
  expect(res.body.error).toBe('Giờ kết thúc phải sau giờ bắt đầu')
})

test('khôi phục mặc định', async () => {
  await save(valid({ 'event.start': '14:00', 'event.end': '16:00' }))
  expect((await call(r, 'DELETE', '/api/admin/config', null, auth)).status).toBe(204)
  expect((await call(r, 'GET', '/api/config')).body).toEqual({ settings: {} })
})
