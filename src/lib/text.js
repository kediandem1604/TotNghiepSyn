/** Thay {ten}, {link}… trong mẫu; khoá không có thì giữ nguyên. */
export function fillTemplate(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m))
}

/** "Anh Tiến Quốc" / "Tiến Quốc" / "bạn" khi không có khách. */
export function displayName(guest) {
  if (!guest || !guest.name) return 'bạn'
  return [guest.title, guest.name].filter(Boolean).join(' ')
}
