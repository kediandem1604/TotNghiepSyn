import { HttpError, json } from './http.js'
import { publicRoutes } from './handlers/public.js'
import { adminRoutes } from './handlers/admin.js'

const PREFIXES = ['/.netlify/functions/api', '/api']

const defaultId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10)

/**
 * Router API thuần: nhận Request, trả Response.
 * Không phụ thuộc Netlify — chạy được trong test, Vite dev và Netlify Functions.
 */
export function createRouter({ store, adminPassword = '', now = () => new Date(), randomId = defaultId }) {
  const deps = { store, adminPassword, now, randomId }
  const routes = [...publicRoutes(deps), ...adminRoutes(deps)]

  return async function handle(req) {
    try {
      const { pathname } = new URL(req.url)
      const prefix = PREFIXES.find((p) => pathname === p || pathname.startsWith(p + '/'))
      const path = prefix ? pathname.slice(prefix.length).replace(/\/+$/, '') : null
      if (path !== null) {
        for (const [method, pattern, handler] of routes) {
          if (method !== req.method) continue
          const m = path.match(pattern)
          if (m) return await handler(req, m.slice(1))
        }
      }
      throw new HttpError(404, 'Không tìm thấy')
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { error: err.message })
      console.error('[api]', err)
      return json(500, { error: 'Có lỗi xảy ra, bạn thử lại nhé' })
    }
  }
}
