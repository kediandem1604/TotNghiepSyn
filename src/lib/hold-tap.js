/**
 * Nút "chạm hoặc giữ": chạm nhanh rồi thả = 1 lần; giữ quá `holdDelay` thì lặp
 * mỗi `interval`. Bị huỷ (vd. bắt đầu vuốt để cuộn trang) trước khi thả thì không tính.
 */
export function createHoldTap(onTap, { holdDelay = 250, interval = 125 } = {}) {
  let pressed = false
  let holding = false
  let delayTimer
  let repeatTimer

  const clear = () => {
    clearTimeout(delayTimer)
    clearInterval(repeatTimer)
  }

  return {
    down() {
      clear()
      pressed = true
      holding = false
      delayTimer = setTimeout(() => {
        holding = true
        onTap()
        repeatTimer = setInterval(onTap, interval)
      }, holdDelay)
    },
    up() {
      if (pressed && !holding) onTap()
      pressed = holding = false
      clear()
    },
    cancel() {
      pressed = holding = false
      clear()
    },
  }
}
