import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { withTimeout } from '../src/lib/async.js'
import { createHoldTap } from '../src/lib/hold-tap.js'
import { nextFlushDelay } from '../src/lib/reactions.js'
import { pauseWhenHidden } from '../src/sections/music.js'
import { previewLink } from '../src/admin/share.js'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

// ── Link riêng không chờ mãi khi mạng treo ─────────────────
test('withTimeout: xong trước hạn thì trả kết quả', async () => {
  await expect(withTimeout(Promise.resolve(5), 1000)).resolves.toBe(5)
})

test('withTimeout: quá hạn thì báo lỗi để rơi về thiệp chung', async () => {
  const assertion = expect(withTimeout(new Promise(() => {}), 2500)).rejects.toThrow('timeout')
  vi.advanceTimersByTime(2500)
  await assertion
})

// ── Vuốt để cuộn không bị tính là thả cảm xúc ──────────────
test('chạm nhanh rồi thả = 1 lần', () => {
  let n = 0
  const t = createHoldTap(() => n++)
  t.down()
  vi.advanceTimersByTime(80)
  t.up()
  expect(n).toBe(1)
})

test('bắt đầu cuộn (pointercancel) = 0 lần', () => {
  let n = 0
  const t = createHoldTap(() => n++)
  t.down()
  vi.advanceTimersByTime(60)
  t.cancel()
  vi.advanceTimersByTime(1000)
  t.up()
  expect(n).toBe(0)
})

test('giữ thì lặp đều, thả không cộng thêm', () => {
  let n = 0
  const t = createHoldTap(() => n++, { holdDelay: 250, interval: 125 })
  t.down()
  vi.advanceTimersByTime(250)
  expect(n).toBe(1)
  vi.advanceTimersByTime(375)
  expect(n).toBe(4)
  t.up()
  vi.advanceTimersByTime(500)
  expect(n).toBe(4)
})

test('thả khi chưa nhấn thì không tính', () => {
  let n = 0
  createHoldTap(() => n++).up()
  expect(n).toBe(0)
})

// ── Gửi cảm xúc lỗi thì chờ, không dội máy chủ ─────────────
test('gửi lỗi thì chờ 5 giây dù còn cảm xúc chờ gửi', () => {
  expect(nextFlushDelay({ ok: false, hasPending: true })).toBe(5000)
})

test('gửi xong mà còn cảm xúc thì gửi tiếp sau 300ms; hết thì thôi', () => {
  expect(nextFlushDelay({ ok: true, hasPending: true })).toBe(300)
  expect(nextFlushDelay({ ok: true, hasPending: false })).toBe(null)
})

// ── Nhạc dừng khi khách rời tab/app ────────────────────────
function fakeDoc() {
  const listeners = {}
  return {
    hidden: false,
    addEventListener: (ev, fn) => (listeners[ev] = fn),
    fire: () => listeners.visibilitychange(),
  }
}
function fakeAudio(paused) {
  return {
    paused,
    play: vi.fn(function () {
      this.paused = false
      return Promise.resolve()
    }),
    pause: vi.fn(function () {
      this.paused = true
    }),
  }
}

test('đang phát → rời app thì dừng, quay lại thì phát tiếp', () => {
  const doc = fakeDoc()
  const audio = fakeAudio(false)
  pauseWhenHidden(audio, doc)
  doc.hidden = true
  doc.fire()
  expect(audio.pause).toHaveBeenCalledTimes(1)
  doc.hidden = false
  doc.fire()
  expect(audio.play).toHaveBeenCalledTimes(1)
})

test('đang tắt nhạc → quay lại không tự phát', () => {
  const doc = fakeDoc()
  const audio = fakeAudio(true)
  pauseWhenHidden(audio, doc)
  doc.hidden = true
  doc.fire()
  doc.hidden = false
  doc.fire()
  expect(audio.play).not.toHaveBeenCalled()
})

// ── Link trong trang quản lí là link xem thử ───────────────
test('link mở từ trang quản lí không tính là khách đã mở', () => {
  expect(previewLink('tien-quoc')).toBe('/tien-quoc?xem-thu=1')
})
