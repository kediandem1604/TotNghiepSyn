// Thiệp QR có tên: ảnh 1080×1350 (nền trời, "Thân mời [tên]", mã QR, tên lễ, ngày giờ).
// File này chỉ được tải khi bấm nút QR, nên trang quản lí mở nhanh như cũ.
import { h, toast } from '../lib/dom.js'
import { icons } from '../lib/icons.js'
import { qrMatrix, qrCardTexts, qrFileName, fitFontSize } from '../lib/qr.js'

const W = 1080
const H = 1350
const NAVY = '#13304f'
const BLUE = '#2378c2'
const SOFT = '#4a6585'
const SCRIPT = '"Great Vibes", cursive'
const DISPLAY = '"Playfair Display", Georgia, serif'
const BODY = 'Quicksand, system-ui, sans-serif'

/** Nạp sẵn font (kèm bảng chữ tiếng Việt) trước khi vẽ lên canvas. */
async function loadFonts(t) {
  const all = Object.values(t).join(' ')
  try {
    await Promise.all([
      document.fonts.load(`110px ${SCRIPT}`, t.name),
      document.fonts.load(`italic 400 44px ${DISPLAY}`, t.lead),
      document.fonts.load(`600 46px ${DISPLAY}`, t.title),
      document.fonts.load(`600 32px ${BODY}`, all),
      document.fonts.load(`500 26px ${BODY}`, t.link),
    ])
  } catch {
    /* thiếu font thì vẽ bằng font dự phòng */
  }
}

function cloud(ctx, x, y, s, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x, y, 44 * s, 0, Math.PI * 2)
  ctx.arc(x + 52 * s, y - 18 * s, 58 * s, 0, Math.PI * 2)
  ctx.arc(x + 110 * s, y + 4 * s, 40 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x - 40 * s, y, 190 * s, 44 * s, 22 * s)
  ctx.fill()
  ctx.restore()
}

function cap(ctx, x, y) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.12)
  ctx.fillStyle = '#21497a'
  ctx.beginPath()
  ctx.moveTo(-34, 6)
  ctx.lineTo(-34, 24)
  ctx.quadraticCurveTo(0, 42, 34, 24)
  ctx.lineTo(34, 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = NAVY
  ctx.beginPath()
  ctx.moveTo(0, -26)
  ctx.lineTo(58, 0)
  ctx.lineTo(0, 24)
  ctx.lineTo(-58, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#f2c46d'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(46, 4)
  ctx.lineTo(46, 34)
  ctx.stroke()
  ctx.fillStyle = '#f2c46d'
  ctx.beginPath()
  ctx.arc(46, 40, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function text(ctx, str, y, font, color, maxWidth = 960) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.fillText(str, W / 2, y, maxWidth)
}

/** Vẽ thiệp QR lên canvas. */
export function drawQrCard(canvas, t, matrix) {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // Trời, nắng, mây
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#8fcdfb')
  sky.addColorStop(0.6, '#d6edff')
  sky.addColorStop(1, '#fff2ea')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  const sun = ctx.createRadialGradient(900, 150, 0, 900, 150, 380)
  sun.addColorStop(0, 'rgba(255,251,234,0.95)')
  sun.addColorStop(1, 'rgba(255,251,234,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, W, H)
  cloud(ctx, 90, 120, 1, 0.85)
  cloud(ctx, 880, 520, 0.8, 0.7)
  cloud(ctx, 60, 760, 0.7, 0.6)

  // Đầu thiệp
  cap(ctx, W / 2, 62)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '8px'
  text(ctx, t.eyebrow, 150, `600 30px ${BODY}`, BLUE)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  text(ctx, t.lead, 218, `italic 400 44px ${DISPLAY}`, SOFT)
  const size = fitFontSize((s, px) => {
    ctx.font = `${px}px ${SCRIPT}`
    return ctx.measureText(s).width
  }, t.name, 900, 120, 56)
  text(ctx, t.name, 330, `${size}px ${SCRIPT}`, NAVY)

  // Khung trắng chứa mã QR
  const box = 680
  const bx = (W - box) / 2
  const by = 370
  ctx.save()
  ctx.shadowColor = 'rgba(19,48,79,0.18)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.roundRect(bx, by, box, box, 44)
  ctx.fill()
  ctx.restore()
  const n = matrix.length
  const cell = Math.floor((box - 100) / n)
  const qx = bx + (box - cell * n) / 2
  const qy = by + (box - cell * n) / 2
  ctx.fillStyle = NAVY
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) if (matrix[r][c]) ctx.fillRect(qx + c * cell, qy + r * cell, cell, cell)

  // Chân thiệp
  text(ctx, t.hint, 1112, `600 32px ${BODY}`, SOFT)
  text(ctx, t.title, 1190, `600 46px ${DISPLAY}`, NAVY)
  text(ctx, t.date, 1248, `600 34px ${BODY}`, BLUE)
  text(ctx, t.link, 1302, `500 26px ${BODY}`, SOFT)
}

/** Mở hộp xem thiệp QR với nút Tải ảnh / Chia sẻ. `slug` null = link chung. */
export async function openQrCard({ name, slug, link, content }) {
  const t = qrCardTexts({ name, content, link })
  await loadFonts(t)
  const canvas = document.createElement('canvas')
  drawQrCard(canvas, t, qrMatrix(link))
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('canvas')
  const url = URL.createObjectURL(blob)
  const fileName = qrFileName(slug)
  const file = new File([blob], fileName, { type: 'image/png' })
  const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const dialog = h('dialog', { class: 'qr-dialog', attrs: { 'aria-label': `Thiệp QR cho ${t.name}` } },
    h('img', { class: 'qr-dialog__img', src: url, alt: `Thiệp QR mời ${t.name}, quét để mở ${t.link}` }),
    h('div', { class: 'qr-dialog__actions' },
      h('a', { class: 'btn btn--primary btn--small', href: url, download: fileName, html: `${icons.download}<span>Tải ảnh</span>` }),
      canShareFile
        ? h('button', {
            class: 'btn btn--ghost btn--small',
            attrs: { type: 'button' },
            html: `${icons.share}<span>Chia sẻ</span>`,
            on: {
              async click() {
                try {
                  await navigator.share({ files: [file], title: 'Thư mời tốt nghiệp' })
                } catch (err) {
                  if (err?.name !== 'AbortError') toast('Không chia sẻ được, bạn bấm Tải ảnh nhé', 'error')
                }
              },
            },
          })
        : null,
      h('button', { class: 'btn btn--ghost btn--small', attrs: { type: 'button' }, text: 'Đóng', on: { click: () => dialog.close() } }),
    ),
  )
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close() // bấm ra ngoài ảnh để đóng
  })
  dialog.addEventListener('close', () => {
    URL.revokeObjectURL(url)
    dialog.remove()
  })
  document.body.append(dialog)
  dialog.showModal()
}
