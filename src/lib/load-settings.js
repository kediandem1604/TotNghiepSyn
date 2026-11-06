import { withTimeout } from './async.js'

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Tải cài đặt thiệp (trang quản lí lưu). Không bao giờ báo lỗi:
 * máy chủ lỗi, chậm quá `ms` hoặc trả dữ liệu sai thì dùng {} (nội dung gốc).
 */
export async function loadSettings(getConfig, ms = 2500) {
  try {
    const res = await withTimeout(getConfig(), ms)
    return isObject(res?.settings) ? res.settings : {}
  } catch {
    return {}
  }
}
