/**
 * Sau một lượt gửi cảm xúc, bao lâu thì gửi tiếp (ms), hoặc null nếu không cần.
 * Lỗi → chờ 5 giây để không dội máy chủ (và không tốn lượt gọi hàm miễn phí).
 */
export function nextFlushDelay({ ok, hasPending }) {
  if (!ok) return 5000
  return hasPending ? 300 : null
}
