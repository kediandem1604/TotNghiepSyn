/** Lỗi có mã HTTP và thông báo tiếng Việt cho người dùng. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export function noContent() {
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
}

/** Đọc body JSON (object), giới hạn kích thước. */
export async function readJson(req, maxBytes) {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared > maxBytes) throw new HttpError(413, 'Nội dung quá dài')
  const buf = await req.arrayBuffer()
  if (buf.byteLength > maxBytes) throw new HttpError(413, 'Nội dung quá dài')
  if (buf.byteLength === 0) return {}
  let data
  try {
    data = JSON.parse(new TextDecoder().decode(buf))
  } catch {
    throw new HttpError(400, 'Dữ liệu không hợp lệ')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Dữ liệu không hợp lệ')
  return data
}
