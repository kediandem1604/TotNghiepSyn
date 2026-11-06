import { test, expect } from 'vitest'
import { fillTemplate, displayName, parseBulkLine } from '../src/lib/text.js'

test('dòng thêm hàng loạt: "Tên" hoặc "Xưng hô | Tên"', () => {
  expect(parseBulkLine('Tiến Quốc')).toEqual({ title: '', name: 'Tiến Quốc' })
  expect(parseBulkLine(' Anh | Minh Trí ')).toEqual({ title: 'Anh', name: 'Minh Trí' })
  expect(parseBulkLine('Chị|Vy|Nguyễn')).toEqual({ title: 'Chị', name: 'Vy Nguyễn' })
  expect(parseBulkLine('Anh | ')).toEqual({ title: 'Anh', name: '' })
})
import { parseRoute } from '../src/lib/route.js'

test('điền mẫu lời mời', () => {
  expect(fillTemplate('Mời {ten}: {link}', { ten: 'Anh Quốc', link: 'https://x/q' })).toBe('Mời Anh Quốc: https://x/q')
})

test('tên hiển thị kèm xưng hô', () => {
  expect(displayName({ title: 'Anh', name: 'Tiến Quốc' })).toBe('Anh Tiến Quốc')
  expect(displayName({ title: '', name: 'Vy' })).toBe('Vy')
  expect(displayName(null)).toBe('bạn')
})

test('đọc slug từ đường dẫn', () => {
  expect(parseRoute({ pathname: '/tien-quoc', search: '' })).toEqual({ slug: 'tien-quoc', preview: false })
  expect(parseRoute({ pathname: '/', search: '' })).toEqual({ slug: null, preview: false })
  expect(parseRoute({ pathname: '/quan-li', search: '' }).slug).toBe(null)
  expect(parseRoute({ pathname: '/vy/', search: '?xem-thu=1' })).toEqual({ slug: 'vy', preview: true })
})
