import path from 'node:path'
import { loadEnv } from 'vite'
import { createRouter } from './server/router.js'
import { createFileStore } from './server/store/file.js'

const DEV_PASSWORD = 'thiep-dev'

/** Khi chạy `npm run dev`: phục vụ /api bằng router thật, dữ liệu lưu ở .data/ */
export function apiPlugin() {
  return {
    name: 'thiep-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      const adminPassword = env.ADMIN_PASSWORD || DEV_PASSWORD
      if (!env.ADMIN_PASSWORD) {
        server.config.logger.info(`\n  [thiep] Mật khẩu quản lí khi dev: ${DEV_PASSWORD}\n`)
      }
      const router = createRouter({
        store: createFileStore(path.join(server.config.root, '.data')),
        adminPassword,
      })

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '/'
        if (url === '/quan-li' || url.startsWith('/quan-li?')) {
          res.statusCode = 302
          res.setHeader('location', url.replace('/quan-li', '/quan-li/'))
          return res.end()
        }
        if (!(url === '/api' || url.startsWith('/api/') || url.startsWith('/api?'))) return next()
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = chunks.length ? Buffer.concat(chunks) : undefined
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
          }
          const request = new Request(`http://${req.headers.host || 'localhost'}${url}`, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          })
          const response = await router(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}
