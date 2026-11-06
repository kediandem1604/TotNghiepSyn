import { test, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createMemoryStore } from '../server/store/memory.js'
import { createFileStore } from '../server/store/file.js'
import { createBlobsStore } from '../server/store/blobs.js'
import { update } from '../server/store/update.js'

const stores = [
  ['memory', async () => createMemoryStore()],
  ['file', async () => createFileStore(fs.mkdtempSync(path.join(os.tmpdir(), 'thiep-')))],
]

test.each(stores)('%s: ghi mới, đọc, xung đột etag', async (_, make) => {
  const s = await make()
  expect(await s.get('k')).toBeNull()
  expect(await s.set('k', { a: 1 }, { etag: null })).toBe(true)
  expect(await s.set('k', { a: 2 }, { etag: null })).toBe(false)
  const { data, etag } = await s.get('k')
  expect(data).toEqual({ a: 1 })
  expect(await s.set('k', { a: 3 }, { etag })).toBe(true)
  expect(await s.set('k', { a: 4 }, { etag })).toBe(false)
  expect((await s.get('k')).data).toEqual({ a: 3 })
})

test.each(stores)('%s: dữ liệu đọc ra là bản sao', async (_, make) => {
  const s = await make()
  await s.set('k', { list: [1] }, { etag: null })
  const first = await s.get('k')
  first.data.list.push(2)
  expect((await s.get('k')).data).toEqual({ list: [1] })
})

test.each(stores)('%s: update — ghi đồng thời đều được giữ', async (_, make) => {
  const s = await make()
  const noWait = { sleep: () => Promise.resolve() }
  await Promise.all(
    [1, 2, 3].map((n) => update(s, 'list', (d) => ({ items: [...d.items, n] }), { items: [] }, noWait)),
  )
  expect((await s.get('list')).data.items.sort()).toEqual([1, 2, 3])
})

test('update: hết lượt thử thì báo 503', async () => {
  const s = { get: async () => ({ data: {}, etag: '1' }), set: async () => false }
  await expect(update(s, 'k', (d) => d, {}, { retries: 2, sleep: async () => {} })).rejects.toMatchObject({
    status: 503,
  })
})

test('update: lỗi do hàm cập nhật ném ra được truyền nguyên', async () => {
  const s = createMemoryStore()
  const boom = Object.assign(new Error('Không tìm thấy'), { status: 404 })
  await expect(
    update(s, 'k', () => {
      throw boom
    }, {}),
  ).rejects.toBe(boom)
})

test('blobs adapter dùng onlyIfNew / onlyIfMatch', async () => {
  const calls = []
  const fake = {
    getWithMetadata: async () => ({ data: { x: 1 }, etag: '"e1"' }),
    setJSON: async (k, d, o) => {
      calls.push(o)
      return { modified: true }
    },
  }
  const s = createBlobsStore(fake)
  expect(await s.get('k')).toEqual({ data: { x: 1 }, etag: '"e1"' })
  expect(await s.set('k', {}, { etag: null })).toBe(true)
  await s.set('k', {}, { etag: '"e1"' })
  expect(calls).toEqual([{ onlyIfNew: true }, { onlyIfMatch: '"e1"' }])
})

test('blobs adapter: không có khoá → null; ghi xung đột → false', async () => {
  const fake = { getWithMetadata: async () => null, setJSON: async () => ({ modified: false }) }
  const s = createBlobsStore(fake)
  expect(await s.get('k')).toBeNull()
  expect(await s.set('k', {}, { etag: null })).toBe(false)
})
