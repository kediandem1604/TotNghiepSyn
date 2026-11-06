// Biểu tượng SVG tĩnh (nét 1.8, theo màu chữ hiện tại)
const svg = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`

export const icons = {
  calendar: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  route: svg('<path d="M5 19h9a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h9"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>'),
  phone: svg('<path d="M5 4h3l1.5 4.5-2 1.2a11 11 0 0 0 6.8 6.8l1.2-2L20 16v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>'),
  chat: svg('<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>'),
  messenger: svg('<path d="M12 3.5c-4.8 0-8.5 3.5-8.5 8 0 2.5 1.2 4.7 3 6.1V21l3-1.6c.8.2 1.6.3 2.5.3 4.8 0 8.5-3.5 8.5-8s-3.7-8.2-8.5-8.2z"/><path d="m7.5 13.8 3-3.2 2.1 2 3.4-3.2-3 3.2-2.1-2z"/>'),
  facebook: svg('<circle cx="12" cy="12" r="8.5"/><path d="M15.6 7.6h-1.4c-1.4 0-2.1.8-2.1 2.2v10.7M9.6 12.7h5.4"/>'),
  qr: svg('<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.5v2.5H14zM19.5 14v2.5M14 19.5h2.5M19.5 19.5v.5"/>'),
  download: svg('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14"/>'),
  send: svg('<path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5z"/>'),
  bulb: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'),
  copy: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>'),
  share: svg('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  edit: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  trash: svg('<path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>'),
  refresh: svg('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4"/>'),
  logout: svg('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  arrowDown: svg('<path d="M12 5v14m0 0-5-5m5 5 5-5"/>'),
  left: svg('<path d="m15 5-7 7 7 7"/>'),
  right: svg('<path d="m9 5 7 7-7 7"/>'),
}

/** Mũ tốt nghiệp (tô màu) */
export const capSvg = (size = 28, color = '#13304F', tassel = '#F2C46D') =>
  `<svg viewBox="0 0 64 48" width="${size}" height="${(size * 48) / 64}" aria-hidden="true"><path d="M32 4 2 17l30 13 30-13z" fill="${color}"/><path d="M14 23v11c0 4 8 8 18 8s18-4 18-8V23l-18 8z" fill="${color}" opacity=".88"/><path d="M58 18.5V33" stroke="${tassel}" stroke-width="2.4" stroke-linecap="round"/><circle cx="58" cy="35" r="3.2" fill="${tassel}"/><circle cx="32" cy="17" r="2.6" fill="${tassel}"/></svg>`

/** Máy bay giấy */
export const planeSvg = (size = 64) =>
  `<svg viewBox="0 0 96 64" width="${size}" height="${(size * 64) / 96}" aria-hidden="true"><path d="M2 30 94 2 58 60 44 40z" fill="#fff"/><path d="M94 2 44 40l-4 20 14-14" fill="#d6ebfb"/><path d="M94 2 44 40 2 30z" fill="#fff" stroke="#bfe3ff" stroke-width="1.2" stroke-linejoin="round"/><path d="M94 2 58 60 44 40z" fill="#eef7ff" stroke="#bfe3ff" stroke-width="1.2" stroke-linejoin="round"/></svg>`
