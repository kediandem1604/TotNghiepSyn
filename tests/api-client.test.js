import { test, expect, vi, afterEach } from 'vitest'
import { api, createAdminApi } from '../src/lib/api.js'

afterEach(() => vi.unstubAllGlobals())

const respond = (body, init) => vi.stubGlobal('fetch', vi.fn(async () => new Response(body, init)))

test('/api trả nhầm trang HTML → báo lỗi rõ ràng thay vì trả null', async () => {
  respond('<!doctype html><html></html>', { status: 200, headers: { 'content-type': 'text/html' } })
  await expect(createAdminApi('x').overview()).rejects.toMatchObject({ status: 200 })
  await expect(api.getWishes()).rejects.toThrow(/máy chủ/i)
})

test('JSON bình thường vẫn chạy; 204 trả null', async () => {
  respond(JSON.stringify({ wishes: [], reactions: {} }), { status: 200, headers: { 'content-type': 'application/json' } })
  await expect(api.getWishes()).resolves.toEqual({ wishes: [], reactions: {} })
  respond(null, { status: 204 })
  await expect(api.markOpened('a')).resolves.toBeNull()
})
