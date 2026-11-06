import { getStore } from '@netlify/blobs'
import { createRouter } from '../../server/router.js'
import { createBlobsStore } from '../../server/store/blobs.js'

let router

function getRouter() {
  if (!router) {
    const env = globalThis.Netlify?.env
    router = createRouter({
      store: createBlobsStore(getStore({ name: 'thiep', consistency: 'strong' })),
      adminPassword: env?.get('ADMIN_PASSWORD') ?? process.env.ADMIN_PASSWORD ?? '',
    })
  }
  return router
}

export default async (req) => getRouter()(req)

// Hàm chạy cho mọi đường dẫn /api/... (ưu tiên hơn redirect /* → /index.html)
export const config = {
  path: ['/api', '/api/*'],
}
