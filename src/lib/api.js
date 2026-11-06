export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body, headers = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Không kết nối được, bạn kiểm tra mạng nhé')
  }
  if (res.status === 204) return null
  let data = null
  try {
    data = await res.json()
  } catch {
    /* body rỗng hoặc không phải JSON */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Có lỗi xảy ra, bạn thử lại nhé')
  // /api trả về trang HTML (cấu hình máy chủ sai) thay vì dữ liệu.
  if (data === null) throw new ApiError(res.status, 'Máy chủ trả về dữ liệu không đúng, bạn kiểm tra lại phần /api nhé')
  return data
}

const seg = (s) => encodeURIComponent(s)

export const api = {
  getConfig: () => request('GET', '/config'),
  getGuest: (slug) => request('GET', `/guests/${seg(slug)}`),
  markOpened: (slug) => request('POST', `/guests/${seg(slug)}/opened`),
  sendRsvp: (body) => request('POST', '/rsvp', body),
  getWishes: () => request('GET', '/wishes'),
  sendWish: (body) => request('POST', '/wishes', body),
  sendReactions: (counts) => request('POST', '/reactions', { counts }),
}

export function createAdminApi(password) {
  const auth = { authorization: `Bearer ${encodeURIComponent(password)}` }
  return {
    overview: () => request('GET', '/admin/overview', null, auth),
    addGuests: (guests) => request('POST', '/admin/guests', { guests }, auth),
    updateGuest: (slug, patch) => request('PATCH', `/admin/guests/${seg(slug)}`, patch, auth),
    deleteGuest: (slug) => request('DELETE', `/admin/guests/${seg(slug)}`, null, auth),
    deleteWish: (id) => request('DELETE', `/admin/wishes/${seg(id)}`, null, auth),
    getConfig: () => request('GET', '/config'),
    saveConfig: (settings) => request('PUT', '/admin/config', { settings }, auth),
    resetConfig: () => request('DELETE', '/admin/config', null, auth),
  }
}
