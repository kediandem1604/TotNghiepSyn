/**
 * Bọc một kho Netlify Blobs (kết quả của getStore()) thành Store chung.
 * Ghi có điều kiện bằng etag để hai người gửi cùng lúc không đè nhau.
 */
export function createBlobsStore(blobStore) {
  return {
    async get(key) {
      const res = await blobStore.getWithMetadata(key, { type: 'json' })
      return res ? { data: res.data, etag: res.etag } : null
    },
    async set(key, data, { etag }) {
      const res = await blobStore.setJSON(key, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true })
      return Boolean(res?.modified)
    },
  }
}
