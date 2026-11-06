import { test, expect } from 'vitest'
import { SETTINGS_GROUPS, SETTINGS_FIELDS, getPath, setPath, pickSettings, mergeSettings } from '../shared/settings.js'

const content = {
  graduate: { fullName: 'Ngọc Thắm', shortName: 'Thắm', degree: '', major: '', school: '' },
  event: { date: '2026-11-26', start: '10:00', end: '12:00', note: '' },
  venue: { name: 'Trường ĐH KHTN', address: '227 Nguyễn Văn Cừ', mapQuery: 'KHTN', directionsUrl: 'https://maps.app.goo.gl/x' },
  music: { src: '', youtube: 'https://www.youtube.com/watch?v=jNne1xPAHEY', spotify: '', title: '佩奇的夏天' },
  photos: { hero: '/anh/tham-chibi.svg', gallery: [] },
  contact: { phone: '', zalo: '', messenger: '' },
  texts: { heroQuote: 'Bầu trời', inviteLead: 'Thân mời', inviteBody: 'đến chung vui', closing: 'Cảm ơn\nmọi người', shareTemplate: 'Mời {ten}: {link}' },
  wishSuggestions: ['Chúc mừng!'],
}

test('đủ 21 ô theo spec, 4 nhóm đúng thứ tự, không trùng', () => {
  expect(SETTINGS_GROUPS.map((g) => g.title)).toEqual(['Thời gian', 'Địa điểm', 'Tên & lời văn', 'Nhạc & liên hệ'])
  expect(SETTINGS_FIELDS.map((f) => f.path)).toEqual([
    'event.date', 'event.start', 'event.end', 'event.note',
    'venue.name', 'venue.address', 'venue.mapQuery', 'venue.directionsUrl',
    'graduate.fullName', 'graduate.shortName', 'texts.heroQuote', 'texts.inviteLead', 'texts.inviteBody', 'texts.closing', 'texts.shareTemplate',
    'music.youtube', 'music.spotify', 'music.title', 'contact.phone', 'contact.zalo', 'contact.messenger',
  ])
  expect(new Set(SETTINGS_FIELDS.map((f) => f.path)).size).toBe(21)
  for (const f of SETTINGS_FIELDS) expect(typeof f.label).toBe('string')
})

test('ô Spotify nói rõ chỉ dùng khi ô YouTube trống; ô Facebook nhận link trang cá nhân', () => {
  const byPath = Object.fromEntries(SETTINGS_FIELDS.map((f) => [f.path, f]))
  expect(byPath['music.spotify'].hint).toMatch(/YouTube/)
  expect(byPath['contact.messenger'].label).toBe('Facebook')
  expect(byPath['contact.messenger'].hint).toMatch(/link trang cá nhân/)
})

test('getPath / setPath', () => {
  const o = {}
  setPath(o, 'event.start', '14:00')
  expect(o).toEqual({ event: { start: '14:00' } })
  expect(getPath(o, 'event.start')).toBe('14:00')
  expect(getPath(o, 'venue.name')).toBeUndefined()
  expect(getPath(undefined, 'event.start')).toBeUndefined()
})

test('pickSettings lấy đúng các ô sửa được', () => {
  const s = pickSettings(content)
  expect(s.event.date).toBe('2026-11-26')
  expect(s.music.youtube).toBe('https://www.youtube.com/watch?v=jNne1xPAHEY')
  expect(s.texts.closing).toBe('Cảm ơn\nmọi người')
  expect(s.photos).toBeUndefined()
  expect(s.music.src).toBeUndefined()
  expect(pickSettings({}).event.date).toBe('') // ô thiếu → ''
})

test('mergeSettings: ô có giá trị thì thay, ô thiếu giữ mặc định, không đổi content gốc', () => {
  const before = structuredClone(content)
  const m = mergeSettings(content, { event: { start: '14:00' } })
  expect(m.event.start).toBe('14:00')
  expect(m.event.end).toBe('12:00')
  expect(m.venue.name).toBe('Trường ĐH KHTN')
  expect(m.wishSuggestions).toEqual(['Chúc mừng!'])
  expect(content).toEqual(before)
  m.photos.gallery.push('x')
  expect(content.photos.gallery).toEqual([]) // bản sao sâu
})

test('mergeSettings: chuỗi rỗng được dùng (để ẩn phần đó)', () => {
  expect(mergeSettings(content, { venue: { mapQuery: '' } }).venue.mapQuery).toBe('')
  expect(mergeSettings({ ...content, event: { ...content.event, note: 'Đến sớm' } }, { event: { note: '' } }).event.note).toBe('')
})

test('mergeSettings: bỏ qua giá trị không phải chuỗi và khoá lạ', () => {
  const m = mergeSettings(content, { event: { start: 9 }, music: { src: '/nhac/x.mp3' }, la: { x: 'y' } })
  expect(m.event.start).toBe('10:00')
  expect(m.music.src).toBe('')
  expect(m.la).toBeUndefined()
})

test('mergeSettings với {} hoặc undefined → giống content', () => {
  expect(mergeSettings(content, {})).toEqual(content)
  expect(mergeSettings(content, undefined)).toEqual(content)
  expect(mergeSettings(content, null)).toEqual(content)
})
