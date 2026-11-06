/** Store trong bộ nhớ — dùng cho test. */
export function createMemoryStore() {
  const items = new Map() // key → { version, data }

  return {
    async get(key) {
      const item = items.get(key)
      return item ? { data: structuredClone(item.data), etag: String(item.version) } : null
    },
    async set(key, data, { etag }) {
      const item = items.get(key)
      if (etag === null ? item : !item || String(item.version) !== etag) return false
      items.set(key, { version: (item?.version ?? 0) + 1, data: structuredClone(data) })
      return true
    },
  }
}
