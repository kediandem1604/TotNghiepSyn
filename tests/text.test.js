import { test, expect } from 'vitest'
import { fillTemplate, displayName, inviteMessage, pageTitle, escapeHtml } from '../src/lib/text.js'
import { parseRoute } from '../src/lib/route.js'

test('tiêu đề tab trình duyệt theo tên trong cài đặt', () => {
  expect(pageTitle({ graduate: { fullName: 'Thắm Lý' } })).toBe('Thư mời tốt nghiệp · Thắm Lý')
})

test('escapeHtml: chữ người dùng nhập không thành thẻ HTML', () => {
  expect(escapeHtml('<img src=x onerror="alert(1)">&\'')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;')
  expect(escapeHtml('Thắm')).toBe('Thắm')
})

test('tin nhắn gửi khách tự điền ngày giờ theo cài đặt', () => {
  expect(
    inviteMessage({
      template: 'Mời {ten} lúc {gio} {ngay}: {link}',
      name: 'Vy',
      link: 'https://x/vy',
      event: { date: '2026-11-26', start: '14:00', end: '16:00' },
    }),
  ).toBe('Mời Vy lúc 14:00 chiều Thứ Năm, 26/11/2026: https://x/vy')
})

test('điền mẫu lời mời', () => {
  expect(fillTemplate('Mời {ten}: {link}', { ten: 'Anh Quốc', link: 'https://x/q' })).toBe('Mời Anh Quốc: https://x/q')
})

test('tên hiển thị đúng tên đã nhập, không thêm xưng hô (kể cả khách cũ còn lưu xưng hô)', () => {
  expect(displayName({ title: 'Anh', name: 'Anh bé 👻' })).toBe('Anh bé 👻')
  expect(displayName({ title: '', name: 'Vy' })).toBe('Vy')
  expect(displayName({ name: 'Tiến Quốc' })).toBe('Tiến Quốc')
  expect(displayName(null)).toBe('bạn')
})

test('đọc slug từ đường dẫn', () => {
  expect(parseRoute({ pathname: '/tien-quoc', search: '' })).toEqual({ slug: 'tien-quoc', preview: false })
  expect(parseRoute({ pathname: '/', search: '' })).toEqual({ slug: null, preview: false })
  expect(parseRoute({ pathname: '/quan-li', search: '' }).slug).toBe(null)
  expect(parseRoute({ pathname: '/vy/', search: '?xem-thu=1' })).toEqual({ slug: 'vy', preview: true })
})
