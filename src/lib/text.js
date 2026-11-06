/** Thay {ten}, {link}… trong mẫu; khoá không có thì giữ nguyên. */
export function fillTemplate(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m))
}

/** Dòng "Tên" hoặc "Xưng hô | Tên" (thêm khách hàng loạt) → { title, name } */
export function parseBulkLine(line) {
  const parts = String(line).split('|').map((s) => s.trim())
  if (parts.length < 2) return { title: '', name: parts[0] }
  return { title: parts[0], name: parts.slice(1).filter(Boolean).join(' ') }
}

/** "Anh Tiến Quốc" / "Tiến Quốc" / "bạn" khi không có khách. */
export function displayName(guest) {
  if (!guest || !guest.name) return 'bạn'
  return [guest.title, guest.name].filter(Boolean).join(' ')
}
