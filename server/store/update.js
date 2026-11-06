import { HttpError } from '../http.js'

const defaultSleep = () => new Promise((r) => setTimeout(r, 20 + Math.random() * 100))

/**
 * Đọc → sửa → ghi có điều kiện; bị người khác ghi trước thì thử lại.
 * `fn` nhận bản sao dữ liệu (hoặc bản sao `fallback` khi chưa có) và trả dữ liệu mới.
 */
export async function update(store, key, fn, fallback, { retries = 6, sleep = defaultSleep } = {}) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const current = await store.get(key)
    const base = current ? current.data : structuredClone(fallback)
    const next = await fn(base)
    if (await store.set(key, next, { etag: current ? current.etag : null })) return next
    await sleep()
  }
  throw new HttpError(503, 'Máy chủ đang bận, bạn thử lại nhé')
}
