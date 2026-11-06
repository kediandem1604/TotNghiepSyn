/** Thay {ten}, {link}… trong mẫu; khoá không có thì giữ nguyên. */
export function fillTemplate(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m))
}

/** Tên khách đúng như đã nhập (không thêm xưng hô); "bạn" khi không có khách. */
export function displayName(guest) {
  return guest?.name || 'bạn'
}
