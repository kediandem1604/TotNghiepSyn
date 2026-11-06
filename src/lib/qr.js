import qrcode from 'qrcode-generator'
import { eventRange, longDateVi, timeOfDay } from './time.js'

/** Link → ma trận QR (true = ô tối). Mức sửa lỗi M: quét tốt kể cả ảnh hơi mờ. */
export function qrMatrix(text) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)))
}

/** Chữ trên thiệp QR; `name` = tên khách (null → link chung, ghi "bạn"). */
export function qrCardTexts({ name, content, link }) {
  return {
    eyebrow: 'THƯ MỜI TỐT NGHIỆP',
    lead: 'Thân mời',
    name: name || 'bạn',
    hint: 'Quét mã để mở thiệp',
    title: `Lễ tốt nghiệp · ${content.graduate.fullName}`,
    date: `${longDateVi(eventRange(content.event).start)} · ${timeOfDay(content.event.start)}`,
    link: link.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }
}

export const qrFileName = (slug) => `thiep-qr-${slug || 'link-chung'}.png`

/** Cỡ chữ lớn nhất (từ `start` lùi dần về `min`) để `text` rộng không quá `maxWidth`. */
export function fitFontSize(measure, text, maxWidth, start, min) {
  for (let size = start; size > min; size -= 2) if (measure(text, size) <= maxWidth) return size
  return min
}
