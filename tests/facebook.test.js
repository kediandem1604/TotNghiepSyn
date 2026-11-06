import { test, expect } from 'vitest'
import { normalizeFacebook, facebookLink } from '../shared/facebook.js'

test.each([
  ['https://www.facebook.com/l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
  ['facebook.com/l.nth.03105/', 'https://www.facebook.com/l.nth.03105'],
  ['https://m.facebook.com/l.nth.03105?mibextid=ZbWKwL', 'https://www.facebook.com/l.nth.03105'],
  ['https://web.facebook.com/l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
  ['https://m.me/l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
  ['https://www.facebook.com/profile.php?id=100012345678&mibextid=abc', 'https://www.facebook.com/profile.php?id=100012345678'],
  ['https://www.facebook.com/share/1ABcd2EfGh/?mibextid=wwXIfr', 'https://www.facebook.com/share/1ABcd2EfGh/'],
  ['https://www.facebook.com/people/Ngoc-Tham/100012345678/', 'https://www.facebook.com/people/Ngoc-Tham/100012345678/'],
  ['l.nth.03105', 'https://www.facebook.com/l.nth.03105'],
  ['', ''],
])('đọc %j → %j', (input, out) => {
  expect(normalizeFacebook(input)).toBe(out)
})

test.each([['Ngọc Thắm'], ['https://example.com/l.nth.03105'], ['https://www.facebook.com/'], ['https://www.facebook.com/profile.php?id=abc'], ['javascript:alert(1)']])(
  'không đọc được %j → null',
  (input) => {
    expect(normalizeFacebook(input)).toBeNull()
  },
)

test('nút Facebook trên thiệp: link và chữ hiển thị', () => {
  expect(facebookLink('https://www.facebook.com/l.nth.03105')).toEqual({ href: 'https://www.facebook.com/l.nth.03105', text: 'l.nth.03105' })
  // giá trị cũ lưu dạng tên người dùng
  expect(facebookLink('l.nth.03105')).toEqual({ href: 'https://www.facebook.com/l.nth.03105', text: 'l.nth.03105' })
  expect(facebookLink('https://www.facebook.com/share/1ABcd2EfGh/')).toEqual({ href: 'https://www.facebook.com/share/1ABcd2EfGh/', text: 'Trang cá nhân' })
  expect(facebookLink('https://www.facebook.com/profile.php?id=100012345678').text).toBe('Trang cá nhân')
  expect(facebookLink('')).toBeNull()
  expect(facebookLink('Ngọc Thắm')).toBeNull()
})
