import { getStore } from '@netlify/blobs'
import { createRouter } from '../../server/router.js'
import { createBlobsStore } from '../../server/store/blobs.js'

// Tạo kết nối kho mới cho MỖI lượt gọi: Netlify cấp chìa khoá Blobs riêng cho từng lượt
// và chìa khoá hết hạn sau một lúc. Giữ kết nối cũ qua nhiều lượt sẽ làm mọi lệnh đọc/ghi
// lỗi 500 khi chìa khoá đầu tiên hết hạn. Tạo router rất nhẹ (không gọi mạng).
export default async (req) => {
  const env = globalThis.Netlify?.env
  const router = createRouter({
    store: createBlobsStore(getStore({ name: 'thiep', consistency: 'strong' })),
    adminPassword: env?.get('ADMIN_PASSWORD') ?? process.env.ADMIN_PASSWORD ?? '',
  })
  return router(req)
}

// Hàm chạy cho mọi đường dẫn /api/... (ưu tiên hơn redirect /* → /index.html)
export const config = {
  path: ['/api', '/api/*'],
}
