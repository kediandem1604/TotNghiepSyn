import fs from 'node:fs/promises'
import path from 'node:path'

/** Store lưu file JSON trong một thư mục — dùng khi chạy `npm run dev`. */
export function createFileStore(dir) {
  const locks = new Map() // key → Promise của thao tác gần nhất

  const fileOf = (key) => {
    if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Khoá không hợp lệ: ${key}`)
    return path.join(dir, `${key}.json`)
  }

  async function read(key) {
    try {
      return JSON.parse(await fs.readFile(fileOf(key), 'utf8'))
    } catch (err) {
      if (err.code === 'ENOENT') return null
      throw err
    }
  }

  // Chạy lần lượt các thao tác trên cùng một khoá.
  function withLock(key, fn) {
    const prev = locks.get(key) ?? Promise.resolve()
    const next = prev.then(fn, fn)
    locks.set(key, next.catch(() => {}))
    return next
  }

  return {
    async get(key) {
      const item = await read(key)
      return item ? { data: item.data, etag: String(item.version) } : null
    },
    set(key, data, { etag }) {
      return withLock(key, async () => {
        const item = await read(key)
        if (etag === null ? item : !item || String(item.version) !== etag) return false
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(fileOf(key), JSON.stringify({ version: (item?.version ?? 0) + 1, data }, null, 2))
        return true
      })
    },
  }
}
