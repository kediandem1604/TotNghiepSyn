import { test, expect } from 'vitest'
import jsQR from 'jsqr'
import { qrMatrix, qrCardTexts, qrFileName, fitFontSize } from '../src/lib/qr.js'

/** Vẽ ma trận QR ra ảnh RGBA (có viền trắng) rồi cho jsQR đọc ngược. */
function decode(matrix, scale = 4, quiet = 4) {
  const n = matrix.length
  const size = (n + quiet * 2) * scale
  const data = new Uint8ClampedArray(size * size * 4).fill(255)
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (matrix[r][c])
        for (let y = 0; y < scale; y++)
          for (let x = 0; x < scale; x++) {
            const i = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4
            data[i] = data[i + 1] = data[i + 2] = 0
          }
  return jsQR(data, size, size)?.data ?? null
}

test.each([
  'https://ngocthamtn.netlify.app/minh-tri',
  'https://ngocthamtn.netlify.app/',
  'https://ngocthamtn.netlify.app/nguyen-thi-thanh-huong-tran-ngoc-bao-anh-2',
])('mã QR đọc ngược ra đúng link %s', (url) => {
  const m = qrMatrix(url)
  expect(m.length).toBeGreaterThanOrEqual(21)
  expect(m.every((row) => row.length === m.length)).toBe(true)
  expect(decode(m)).toBe(url)
})

const content = {
  graduate: { fullName: 'Ngọc Thắm' },
  event: { date: '2026-11-26', start: '14:00', end: '16:00' },
}

test('chữ trên thiệp QR theo khách và cài đặt', () => {
  expect(qrCardTexts({ name: 'Minh Trí', content, link: 'https://ngocthamtn.netlify.app/minh-tri' })).toEqual({
    eyebrow: 'THƯ MỜI TỐT NGHIỆP',
    lead: 'Thân mời',
    name: 'Minh Trí',
    hint: 'Quét mã để mở thiệp',
    title: 'Lễ tốt nghiệp · Ngọc Thắm',
    date: 'Thứ Năm, 26/11/2026 · 14:00 chiều',
    link: 'ngocthamtn.netlify.app/minh-tri',
  })
  expect(qrCardTexts({ name: null, content, link: 'https://ngocthamtn.netlify.app/' }).name).toBe('bạn')
  expect(qrCardTexts({ name: null, content, link: 'https://ngocthamtn.netlify.app/' }).link).toBe('ngocthamtn.netlify.app')
})

test('tên file ảnh QR', () => {
  expect(qrFileName('minh-tri')).toBe('thiep-qr-minh-tri.png')
  expect(qrFileName(null)).toBe('thiep-qr-link-chung.png')
})

test('cỡ chữ tự thu nhỏ để tên dài vẫn vừa', () => {
  const measure = (text, size) => text.length * size * 0.5 // chữ rộng ~0,5 cỡ chữ
  expect(fitFontSize(measure, 'Vy', 800, 110, 50)).toBe(110)
  expect(fitFontSize(measure, 'x'.repeat(20), 800, 110, 50)).toBe(80)
  expect(fitFontSize(measure, 'x'.repeat(100), 800, 110, 50)).toBe(50)
})
