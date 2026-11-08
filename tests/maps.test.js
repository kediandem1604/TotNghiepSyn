import { test, expect } from 'vitest'
import { mapEmbedUrl } from '../src/lib/maps.js'

// Link cũ google.com/maps?q=…&output=embed chuyển hướng (301) kèm "X-Frame-Options: SAMEORIGIN";
// một số trình duyệt Android (vd. trong Zalo) chặn luôn → ERR_BLOCKED_BY_RESPONSE.
// Nhúng thẳng link đích mà Google chuyển tới (giá trị dưới lấy từ chính Google).

test('link nhúng bản đồ trùng với link đích Google chuyển tới', () => {
  expect(
    mapEmbedUrl('Trường Đại học Khoa học Tự nhiên - Đại học Quốc gia TP.HCM, 227 Nguyễn Văn Cừ, Chợ Quán, Hồ Chí Minh'),
  ).toBe(
    'https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJDhuqFpIGjhu41jIFF14buRYyBnaWEgVFAuSENNLCAyMjcgTmd1eeG7hW4gVsSDbiBD4burLCBDaOG7oyBRdcOhbiwgSOG7kyBDaMOtIE1pbmg',
  )
})

test('ký tự đặc biệt mã hoá giống Google (base64 an toàn cho link, không có =)', () => {
  expect(mapEmbedUrl('Hội trường A? B>')).toMatch(/!1zSOG7mWkgdHLGsOG7nW5nIEE_IEI-$/)
  expect(mapEmbedUrl('ĐH KHTN ~~~ >>>')).toMatch(/!1zxJBIIEtIVE4gfn5-ID4-Pg$/)
})
