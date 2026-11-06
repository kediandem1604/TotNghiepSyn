import { test, expect, vi, afterEach } from 'vitest'
import { loadSettings } from '../src/lib/load-settings.js'
import { ApiError } from '../src/lib/api.js'

afterEach(() => vi.useRealTimers())

test('trả về cài đặt từ máy chủ', async () => {
  const settings = { event: { start: '14:00' } }
  await expect(loadSettings(async () => ({ settings }))).resolves.toEqual(settings)
})

test('máy chủ lỗi (vd. /api trả HTML) → {}', async () => {
  await expect(loadSettings(async () => { throw new ApiError(200, 'Máy chủ trả về dữ liệu không đúng') })).resolves.toEqual({})
})

test('dữ liệu sai dạng → {}', async () => {
  await expect(loadSettings(async () => ({ settings: 'x' }))).resolves.toEqual({})
  await expect(loadSettings(async () => null)).resolves.toEqual({})
  await expect(loadSettings(async () => ({ settings: [1] }))).resolves.toEqual({})
})

test('máy chủ treo → sau 2,5 giây trả {}', async () => {
  vi.useFakeTimers()
  const result = loadSettings(() => new Promise(() => {}))
  await vi.advanceTimersByTimeAsync(2500)
  await expect(result).resolves.toEqual({})
})
