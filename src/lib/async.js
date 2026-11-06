/** Chờ promise tối đa `ms` mili-giây; quá hạn thì báo lỗi 'timeout'. */
export function withTimeout(promise, ms) {
  let timer
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}
