/** Lỗi có mã HTTP và thông báo tiếng Việt cho người dùng. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
