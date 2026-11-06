import { test, expect } from 'vitest'
import { toSlug, uniqueSlug, stripDiacritics } from '../shared/slug.js'

test('bỏ dấu tiếng Việt', () => {
  expect(toSlug('Tiến Quốc')).toBe('tien-quoc')
  expect(toSlug('  Đặng   Thị Ánh ')).toBe('dang-thi-anh')
  expect(toSlug('Lê Khang & Minh Trí!!')).toBe('le-khang-minh-tri')
})

test('chuỗi NFD (iPhone/macOS) cho cùng kết quả', () => {
  expect(toSlug('Tiến Quốc'.normalize('NFD'))).toBe('tien-quoc')
})

test('giới hạn 40 ký tự, không kết thúc bằng gạch', () => {
  const s = toSlug('a'.repeat(39) + ' bcd')
  expect(s.length).toBeLessThanOrEqual(40)
  expect(s.endsWith('-')).toBe(false)
})

test('trùng hoặc dành riêng thì thêm số', () => {
  expect(uniqueSlug('Tiến Quốc', new Set(['tien-quoc']))).toBe('tien-quoc-2')
  expect(uniqueSlug('Tiến Quốc', new Set(['tien-quoc', 'tien-quoc-2']))).toBe('tien-quoc-3')
  expect(uniqueSlug('Quản lí', new Set())).toBe('quan-li-2')
})

test('tên không ra slug thì dùng khach-xxxx', () => {
  expect(uniqueSlug('🎓🎓', new Set(), () => 'ab12')).toBe('khach-ab12')
})

test('stripDiacritics dùng cho tìm kiếm', () => {
  expect(stripDiacritics('Nguyễn Đức').toLowerCase()).toBe('nguyen duc')
})
