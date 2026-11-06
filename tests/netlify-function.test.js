import { test, expect, vi } from 'vitest'

// Netlify cấp "chìa khoá" Blobs (netlifyBlobsContext) mới cho từng lượt gọi và chìa khoá
// hết hạn sau một lúc. getStore() đọc chìa khoá lúc được gọi, nên phải gọi lại mỗi lượt.
const { getStore } = vi.hoisted(() => ({
  getStore: vi.fn(() => ({
    getWithMetadata: async () => null,
    setJSON: async () => ({ modified: true }),
  })),
}))
vi.mock('@netlify/blobs', () => ({ getStore }))

const { default: handler } = await import('../netlify/functions/api.mjs')

test('mỗi lượt gọi API tạo kết nối kho mới (không giữ chìa khoá cũ đã hết hạn)', async () => {
  getStore.mockClear()
  const first = await handler(new Request('https://thiep.test/api/config'))
  const second = await handler(new Request('https://thiep.test/api/config'))
  expect(first.status).toBe(200)
  expect(second.status).toBe(200)
  expect(getStore).toHaveBeenCalledTimes(2)
  expect(getStore).toHaveBeenCalledWith({ name: 'thiep', consistency: 'strong' })
})
