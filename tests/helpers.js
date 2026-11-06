/** Gọi router như một yêu cầu HTTP thật, trả { status, body }. */
export async function call(router, method, path, body = null, headers = {}) {
  const init = { method, headers: { ...headers } }
  if (body !== null && body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
    init.headers['content-type'] = 'application/json'
  }
  const res = await router(new Request(`http://thiep.test${path}`, init))
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null }
}

export const T0 = '2026-11-06T08:00:00.000Z'

export function guest(overrides = {}) {
  return {
    slug: 'tien-quoc',
    name: 'Tiến Quốc',
    title: 'Anh',
    note: '',
    createdAt: T0,
    openCount: 0,
    firstOpenedAt: null,
    lastOpenedAt: null,
    rsvp: null,
    ...overrides,
  }
}
