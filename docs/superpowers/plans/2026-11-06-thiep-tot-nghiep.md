# Thiệp mời tốt nghiệp — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang thiệp mời tốt nghiệp Lý Ngọc Thắm (phong cách "Bầu trời mây") với link riêng từng khách, sổ lời chúc + cảm xúc bay, xác nhận tham dự và trang quản lí, chạy trên Netlify.

**Architecture:** Vite 2 trang (thiệp + quản lí) bằng JS thuần. Toàn bộ API nằm trong một router thuần `Request → Response` (`server/router.js`) nhận một "store" trừu tượng; Netlify Function bọc router với Netlify Blobs, còn khi dev thì plugin Vite bọc router với store file `.data/`. Code dùng chung client/server (slug, hằng số) nằm ở `shared/`.

**Tech Stack:** Vite 8, GSAP 3, @fontsource (Great Vibes, Playfair Display, Quicksand), @netlify/blobs 11, Netlify Functions v2, Vitest 5, Node 20+.

**Spec:** `docs/superpowers/specs/2026-11-06-thiep-tot-nghiep-design.md`

## Global Constraints
- Ngôn ngữ giao diện, thông báo lỗi, chú thích `content.js`, README: tiếng Việt.
- Sự kiện: 2026-11-26, 10:00–12:00, múi giờ cố định UTC+7 (không dùng múi giờ máy người xem).
- Màu chủ đạo xanh da trời; chữ chính màu `--ink: #13304F`.
- Chỉ animate `transform`/`opacity`; tôn trọng `prefers-reduced-motion`.
- Emoji cảm xúc: `tim ❤️, phao 🎉, votay 👏, xucdong 🥹, mu 🎓, hoa 💐`; emoji lời chúc thuộc cùng 6 emoji, mặc định 🎓.
- Giới hạn: tên khách 1–60, xưng hô ≤ 20, lời nhắn ≤ 300, tên người chúc 1–40, lời chúc 1–500, body ≤ 20 KB, ≤ 1000 lời chúc, mỗi loại cảm xúc 0–60/lần gửi, thêm hàng loạt 1–200.
- Slug dành riêng: `quan-li`, `api`, `assets`, `nhac`, `anh`.
- Lời chúc luôn hiển thị bằng `textContent` (không `innerHTML` với dữ liệu người dùng).
- JS trang thiệp ≤ 90 KB gzip (không tính font).
- Không tự deploy; không commit `.data/`, `.env*`.

## Review Focus
1. Tên gõ từ iPhone/macOS ở dạng Unicode tổ hợp (NFD) → slug vẫn đúng `tien-quoc` (test ở Task 2).
2. Hai người gửi lời chúc cùng lúc (etag xung đột) → cả hai đều được lưu (test ở Task 4 và Task 5).
3. Thêm hàng loạt có tên trùng nhau và trùng khách cũ → mỗi người một slug khác (test ở Task 6).
4. Người xem ở múi giờ khác (vd. người thân ở nước ngoài) → thứ, giờ, đếm ngược vẫn theo giờ Việt Nam (test ở Task 3).
5. Lời chúc chứa thẻ HTML / xuống dòng / ký tự điều khiển → lưu nguyên chữ, giữ xuống dòng, bỏ ký tự điều khiển (test ở Task 5).

---

### Task 1: Khung dự án

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.config.js`, `netlify.toml`, `content.js`, `shared/constants.js`, `index.html`, `quan-li/index.html`, `src/main.js`, `src/admin/main.js`, `src/styles/tokens.css`, `src/styles/base.css`, `.claude/launch.json`

**Interfaces:**
- Produces: `content` (default export của `content.js`) với khoá `graduate {fullName, shortName, degree, major, school}`, `event {date:'2026-11-26', start:'10:00', end:'12:00', note}`, `venue {name, address, mapQuery, directionsUrl}`, `music {src, title}`, `photos {hero, gallery: string[]}`, `contact {phone, zalo, messenger}`, `texts {inviteLead, inviteBody, closing, shareTemplate}`, `wishSuggestions: string[]` (≥ 10).
- Produces: `shared/constants.js` → `REACTIONS: {key, emoji, label}[]` (thứ tự như Global Constraints), `WISH_EMOJIS: string[]`, `LIMITS` (các số trong Global Constraints: `guestName, title, note, wishName, wishMessage, maxBody, maxWishes, reactionPerRequest, bulkMax`), `RESERVED_SLUGS`.

- [ ] **Step 1:** `package.json` (`"type": "module"`, scripts `dev`, `build`, `preview`, `test: vitest run`, `deploy: npm run build && npx netlify deploy --prod`), deps `gsap`, `@fontsource/great-vibes`, `@fontsource/playfair-display`, `@fontsource/quicksand`, `@netlify/blobs`; devDeps `vite`, `vitest`. Chạy `npm install`.
- [ ] **Step 2:** `vite.config.js` với `build.rollupOptions.input = { main: 'index.html', admin: 'quan-li/index.html' }`. `vitest.config.js` môi trường `node`, include `tests/**/*.test.js`.
- [ ] **Step 3:** `content.js` có đủ khoá trên. `venue.*`, `music.src`, `photos.*`, `contact.*` để chuỗi rỗng/mảng rỗng kèm chú thích cách điền. `texts.shareTemplate` = `'Thắm trân trọng mời {ten} đến dự lễ tốt nghiệp của Thắm lúc 10:00 sáng Thứ Năm, 26/11/2026 🎓\nThiệp mời: {link}'`.
- [ ] **Step 4:** `tokens.css` (bảng màu sky-50…sky-600, `--ink`, `--gold: #F2C46D`, `--blush: #FFD9E2`, font families, bán kính, bóng), `base.css` (reset, `body` nền `--sky-50`, focus-visible, `.sr-only`, khối `@media (prefers-reduced-motion)`). Hai trang HTML `lang="vi"`, `<meta name="robots" content="noindex">`, nạp CSS + entry JS tương ứng.
- [ ] **Step 5:** `.claude/launch.json` cấu hình `thiep` (`npm run dev`, port 5173).
- [ ] **Step 6:** Chạy `npm run build` → Expected: build xong, `dist/index.html` và `dist/quan-li/index.html` tồn tại.
- [ ] **Step 7:** Commit `chore: khung dự án Vite, nội dung mẫu, hằng số dùng chung`.

---

### Task 2: Tạo slug (`shared/slug.js`)

**Files:** Create `shared/slug.js`, Test `tests/slug.test.js`

**Interfaces:**
- Produces: `stripDiacritics(text: string): string` (bỏ dấu, `đ/Đ → d/D`), `toSlug(text: string): string` (≤ 40 ký tự, có thể rỗng), `uniqueSlug(name: string, taken: Set<string>, rand: () => string = random4): string`.

- [ ] **Step 1: Test**
```js
import { toSlug, uniqueSlug, stripDiacritics } from '../shared/slug.js'
test('bỏ dấu tiếng Việt', () => {
  expect(toSlug('Tiến Quốc')).toBe('tien-quoc')
  expect(toSlug('  Đặng   Thị Ánh ')).toBe('dang-thi-anh')
  expect(toSlug('Lê Khang & Minh Trí!!')).toBe('le-khang-minh-tri')
})
test('chuỗi NFD (iPhone/macOS) cho cùng kết quả', () => {
  expect(toSlug('Tiến Quốc'.normalize('NFD'))).toBe('tien-quoc')
})
test('giới hạn 40 ký tự, không kết thúc bằng gạch', () => {
  const s = toSlug('a'.repeat(39) + ' bcd')
  expect(s.length).toBeLessThanOrEqual(40); expect(s.endsWith('-')).toBe(false)
})
test('trùng hoặc dành riêng thì thêm số', () => {
  expect(uniqueSlug('Tiến Quốc', new Set(['tien-quoc']))).toBe('tien-quoc-2')
  expect(uniqueSlug('Tiến Quốc', new Set(['tien-quoc', 'tien-quoc-2']))).toBe('tien-quoc-3')
  expect(uniqueSlug('Quản lí', new Set())).toBe('quan-li-2')
})
test('tên không ra slug thì dùng khach-xxxx', () => {
  expect(uniqueSlug('🎓🎓', new Set(), () => 'ab12')).toBe('khach-ab12')
})
test('stripDiacritics dùng cho tìm kiếm', () => {
  expect(stripDiacritics('Nguyễn Đức').toLowerCase()).toBe('nguyen duc')
})
```
- [ ] **Step 2:** `npx vitest run tests/slug.test.js` → FAIL (module chưa có).
- [ ] **Step 3:** Cài đặt: `normalize('NFD')` + bỏ `\p{Diacritic}`, thay `đ`; `uniqueSlug` coi `RESERVED_SLUGS` như đã dùng.
- [ ] **Step 4:** Chạy lại → PASS.
- [ ] **Step 5:** Commit `feat: tạo slug tiếng Việt cho link khách`.

---

### Task 3: Thời gian, lịch, chữ mẫu, đường dẫn (`src/lib/`)

**Files:** Create `src/lib/time.js`, `src/lib/text.js`, `src/lib/route.js`; Test `tests/time.test.js`, `tests/text.test.js`

**Interfaces:**
- Produces (`time.js`, mọi hàm tính theo UTC+7, không dùng getter giờ địa phương):
  - `eventRange(event: {date, start, end}): { start: Date, end: Date }`
  - `eventPhase(now: Date, range): 'before' | 'during' | 'after'`
  - `countdown(now: Date, start: Date): { days, hours, minutes, seconds }` (không âm)
  - `monthGrid(year: number, month1to12: number): (number|null)[][]` — tuần bắt đầu thứ Hai
  - `weekdayVi(date: Date): string` ('Thứ Hai'…'Chủ Nhật')
  - `formatDateDots(date: Date): string` → `'26.11.2026'`
  - `formatWishTime(iso: string): string` → `'DD-MM HH:mm'`
  - `googleCalendarUrl({ title, details, location, start, end }): string`
  - `buildIcs({ title, details, location, start, end, uid }): string` (dòng kết thúc `\r\n`)
- Produces (`text.js`): `fillTemplate(tpl: string, vars: Record<string,string>): string` (thay `{key}`), `displayName(guest | null): string` → `'Anh Tiến Quốc'` / `'Tiến Quốc'` (không xưng hô) / `'bạn'` (null).
- Produces (`route.js`): `parseRoute(loc: {pathname, search}): { slug: string|null, preview: boolean }` — `/` → null, `/tien-quoc/` → `'tien-quoc'`, slug dành riêng → null, `?xem-thu=1` → preview.

- [ ] **Step 1: Test**
```js
const ev = { date: '2026-11-26', start: '10:00', end: '12:00' }
test('khung giờ lễ theo +07', () => {
  const r = eventRange(ev)
  expect(r.start.toISOString()).toBe('2026-11-26T03:00:00.000Z')
  expect(r.end.toISOString()).toBe('2026-11-26T05:00:00.000Z')
})
test('trạng thái trước/đang/sau', () => {
  const r = eventRange(ev)
  expect(eventPhase(new Date('2026-11-26T02:59:59Z'), r)).toBe('before')
  expect(eventPhase(new Date('2026-11-26T03:00:00Z'), r)).toBe('during')
  expect(eventPhase(new Date('2026-11-26T05:00:00Z'), r)).toBe('after')
})
test('đếm ngược', () => {
  const r = eventRange(ev)
  expect(countdown(new Date('2026-11-06T02:58:30Z'), r.start)).toEqual({ days: 20, hours: 0, minutes: 1, seconds: 30 })
  expect(countdown(new Date('2026-12-01T00:00:00Z'), r.start)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
})
test('lịch tháng 11/2026 bắt đầu thứ Hai', () => {
  const g = monthGrid(2026, 11)
  expect(g[0]).toEqual([null, null, null, null, null, null, 1])
  expect(g[4][3]).toBe(26)              // 26/11 là thứ Năm
  expect(g.flat().filter(Boolean).length).toBe(30)
})
test('thứ và ngày theo giờ Việt Nam dù máy ở múi khác', () => {
  expect(weekdayVi(new Date('2026-11-26T03:00:00Z'))).toBe('Thứ Năm')
  expect(weekdayVi(new Date('2026-11-25T18:00:00Z'))).toBe('Thứ Năm') // 01:00 sáng 26/11 ở VN
  expect(formatDateDots(new Date('2026-11-25T18:00:00Z'))).toBe('26.11.2026')
  expect(formatWishTime('2026-11-05T23:30:00Z')).toBe('06-11 06:30')
})
test('link Google Calendar và .ics', () => {
  const r = eventRange(ev)
  const url = googleCalendarUrl({ title: 'Lễ tốt nghiệp', details: 'x', location: 'y', ...r })
  expect(url).toContain('dates=20261126T030000Z%2F20261126T050000Z')
  const ics = buildIcs({ title: 'Lễ tốt nghiệp', details: 'a, b', location: 'y', uid: 'u1', ...r })
  expect(ics).toContain('DTSTART:20261126T030000Z\r\n')
  expect(ics).toContain('DESCRIPTION:a\\, b\r\n')
  expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
})
```
`tests/text.test.js`: `fillTemplate('Mời {ten}: {link}', {ten:'Anh Quốc', link:'https://x/q'})` → `'Mời Anh Quốc: https://x/q'`; `displayName({title:'Anh', name:'Tiến Quốc'})` → `'Anh Tiến Quốc'`; `displayName({title:'', name:'Vy'})` → `'Vy'`; `displayName(null)` → `'bạn'`; `parseRoute({pathname:'/tien-quoc', search:''})` → `{slug:'tien-quoc', preview:false}`; `parseRoute({pathname:'/quan-li', search:''}).slug` → `null`; `parseRoute({pathname:'/vy/', search:'?xem-thu=1'})` → `{slug:'vy', preview:true}`.
- [ ] **Step 2:** `npx vitest run tests/time.test.js tests/text.test.js` → FAIL.
- [ ] **Step 3:** Cài đặt; giờ VN = dịch instant +7h rồi dùng getter `getUTC*`.
- [ ] **Step 4:** Chạy lại → PASS.
- [ ] **Step 5:** Commit `feat: tính giờ lễ, lịch tháng, link lịch và mẫu lời mời`.

---

### Task 4: Store và cập nhật có điều kiện (`server/store/`)

**Files:** Create `server/store/memory.js`, `server/store/file.js`, `server/store/blobs.js`, `server/store/update.js`; Test `tests/store.test.js`

**Interfaces:**
- Produces: kiểu `Store = { get(key): Promise<{data, etag: string} | null>, set(key, data, { etag: string|null }): Promise<boolean> }` — `etag: null` = chỉ ghi khi chưa tồn tại; trả `false` khi xung đột.
- Produces: `createMemoryStore(): Store`, `createFileStore(dir: string): Store` (file `<dir>/<key>.json` dạng `{ version, data }`, etag = `String(version)`, hàng đợi khoá trong tiến trình), `createBlobsStore(blobStore): Store` (dùng `getWithMetadata(key, { type: 'json' })` và `setJSON(key, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true })`, trả `result.modified`).
- Produces: `update(store, key, fn: (data) => data, fallback, { retries = 6, sleep }): Promise<data>` — `fn` nhận bản sao sâu; ném `HttpError(503, 'Máy chủ đang bận, bạn thử lại nhé')` khi hết lượt; lỗi do `fn` ném ra được truyền nguyên.

- [ ] **Step 1: Test** (chạy cùng bộ test cho memory và file store với thư mục tạm `fs.mkdtempSync`)
```js
test.each(stores)('%s: ghi mới, đọc, xung đột etag', async (_, make) => {
  const s = await make()
  expect(await s.get('k')).toBeNull()
  expect(await s.set('k', { a: 1 }, { etag: null })).toBe(true)
  expect(await s.set('k', { a: 2 }, { etag: null })).toBe(false)
  const { data, etag } = await s.get('k')
  expect(data).toEqual({ a: 1 })
  expect(await s.set('k', { a: 3 }, { etag })).toBe(true)
  expect(await s.set('k', { a: 4 }, { etag })).toBe(false)
})
test('update: hai lần ghi đồng thời đều được giữ', async () => {
  const s = createMemoryStore()
  await Promise.all([1, 2, 3].map(n => update(s, 'list', d => ({ items: [...d.items, n] }), { items: [] }, { sleep: () => Promise.resolve() })))
  expect((await s.get('list')).data.items.sort()).toEqual([1, 2, 3])
})
test('update: hết lượt thử thì báo 503', async () => {
  const s = { get: async () => ({ data: {}, etag: '1' }), set: async () => false }
  await expect(update(s, 'k', d => d, {}, { retries: 2, sleep: async () => {} })).rejects.toMatchObject({ status: 503 })
})
test('blobs adapter dùng onlyIfNew / onlyIfMatch', async () => {
  const calls = []
  const fake = { getWithMetadata: async () => ({ data: { x: 1 }, etag: '"e1"' }),
                 setJSON: async (k, d, o) => { calls.push(o); return { modified: true } } }
  const s = createBlobsStore(fake)
  expect(await s.get('k')).toEqual({ data: { x: 1 }, etag: '"e1"' })
  await s.set('k', {}, { etag: null }); await s.set('k', {}, { etag: '"e1"' })
  expect(calls).toEqual([{ onlyIfNew: true }, { onlyIfMatch: '"e1"' }])
})
```
- [ ] **Step 2:** Chạy `npx vitest run tests/store.test.js` → FAIL.
- [ ] **Step 3:** Cài đặt 4 file; `HttpError` lấy từ `server/http.js` (tạo luôn ở task này: `class HttpError extends Error { constructor(status, message) }`). Memory store: `structuredClone` khi đọc/ghi, etag tăng dần. `getWithMetadata` trả `null` khi không có khoá → `get` trả `null`.
- [ ] **Step 4:** Chạy lại → PASS.
- [ ] **Step 5:** Commit `feat: store dữ liệu với ghi có điều kiện (bộ nhớ, file, Netlify Blobs)`.

---

### Task 5: Router và API công khai

**Files:** Create `server/http.js` (bổ sung), `server/validate.js`, `server/router.js`, `server/handlers/public.js`; Test `tests/api-public.test.js`

**Interfaces:**
- Consumes: `Store`, `update` (Task 4); `LIMITS`, `REACTIONS`, `WISH_EMOJIS` (Task 1).
- Produces: `createRouter({ store, adminPassword, now = () => new Date(), randomId }): (req: Request) => Promise<Response>`; chấp nhận tiền tố `/api` và `/.netlify/functions/api`; route lạ → 404 `{ error }`; mọi lỗi `HttpError` → `{ error: message }` với status tương ứng; lỗi khác → 500 `{ error: 'Có lỗi xảy ra, bạn thử lại nhé' }`.
- Produces: `cleanText(value, { label, min = 0, max, multiline = false }): string` — ép chuỗi, NFC, bỏ ký tự điều khiển (giữ `\n` khi multiline, gộp >2 dòng trống), cắt khoảng trắng; ngoài khoảng → `HttpError(400, '<label> cần từ <min> đến <max> ký tự')`.
- Produces: `readJson(req, maxBytes)` → 413 `'Nội dung quá dài'` / 400 `'Dữ liệu không hợp lệ'`.
- Produces route công khai đúng bảng mục 4.4 của spec. Khoá dữ liệu: `guests`, `rsvps`, `wishes`, `reactions` (cấu trúc theo spec 4.3).

- [ ] **Step 1: Test** (helper `call(router, method, path, body?, headers?)` trả `{ status, body }`; khách mẫu được ghi trực tiếp vào memory store)
```js
test('GET khách có/không tồn tại', async () => {
  expect(await call(r, 'GET', '/api/guests/tien-quoc')).toMatchObject({ status: 200, body: { name: 'Tiến Quốc', title: 'Anh', note: '', rsvp: null } })
  expect((await call(r, 'GET', '/api/guests/khong-co')).status).toBe(404)
})
test('ghi nhận mở thiệp', async () => {
  await call(r, 'POST', '/api/guests/tien-quoc/opened'); await call(r, 'POST', '/api/guests/tien-quoc/opened')
  const g = (await store.get('guests')).data.guests[0]
  expect(g.openCount).toBe(2); expect(g.firstOpenedAt).toBe(T0); expect(g.lastOpenedAt).toBe(T0)
})
test('rsvp theo slug và theo tên', async () => {
  expect((await call(r, 'POST', '/api/rsvp', { slug: 'tien-quoc', attending: true })).status).toBe(200)
  expect((await store.get('guests')).data.guests[0].rsvp).toEqual({ attending: true, at: T0 })
  expect((await call(r, 'POST', '/api/rsvp', { name: 'Bé Na', attending: false })).status).toBe(200)
  expect((await store.get('rsvps')).data.rsvps[0]).toMatchObject({ name: 'Bé Na', attending: false })
  expect((await call(r, 'POST', '/api/rsvp', { attending: true })).status).toBe(400)
  expect((await call(r, 'POST', '/api/rsvp', { slug: 'tien-quoc', attending: 'có' })).status).toBe(400)
})
test('gửi lời chúc: giữ HTML dạng chữ, giữ xuống dòng, bỏ ký tự điều khiển', async () => {
  const res = await call(r, 'POST', '/api/wishes', { name: ' Minh Trí ', message: '<b>Chúc</b>\u0007 mừng\nnha', emoji: '🎉', slug: 'tien-quoc' })
  expect(res.status).toBe(201)
  expect(res.body).toMatchObject({ name: 'Minh Trí', message: '<b>Chúc</b> mừng\nnha', emoji: '🎉' })
  const list = await call(r, 'GET', '/api/wishes')
  expect(list.body.wishes[0]).not.toHaveProperty('slug')
  expect(list.body.reactions).toEqual({ tim: 0, phao: 0, votay: 0, xucdong: 0, mu: 0, hoa: 0 })
})
test('lời chúc không hợp lệ', async () => {
  expect((await call(r, 'POST', '/api/wishes', { name: '', message: 'x', emoji: '🎓' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x'.repeat(501), emoji: '🎓' })).status).toBe(400)
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x', emoji: '💩' })).status).toBe(400)
})
test('ô bẫy bot: trả 201 nhưng không lưu', async () => {
  expect((await call(r, 'POST', '/api/wishes', { name: 'Bot', message: 'spam', emoji: '🎓', website: 'x' })).status).toBe(201)
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(0)
})
test('lời chúc gửi đồng thời đều được lưu, mới nhất trước', async () => {
  await Promise.all(['A', 'B', 'C'].map(n => call(r, 'POST', '/api/wishes', { name: n, message: 'hi', emoji: '🎓' })))
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(3)
})
test('cảm xúc: cộng dồn, chặn quá 60 và khoá lạ', async () => {
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: 3, mu: 1 } })).body.counts).toMatchObject({ tim: 3, mu: 1 })
  expect((await call(r, 'POST', '/api/reactions', { counts: { tim: 61 } })).status).toBe(400)
  expect((await call(r, 'POST', '/api/reactions', { counts: { la: 1 } })).status).toBe(400)
})
test('body quá 20KB → 413; route lạ → 404', async () => {
  expect((await call(r, 'POST', '/api/wishes', { name: 'A', message: 'x'.repeat(21000), emoji: '🎓' })).status).toBe(413)
  expect((await call(r, 'GET', '/api/khong-co')).status).toBe(404)
  expect((await call(r, 'GET', '/.netlify/functions/api/wishes')).status).toBe(200)
})
```
- [ ] **Step 2:** `npx vitest run tests/api-public.test.js` → FAIL.
- [ ] **Step 3:** Cài đặt. Router so khớp bằng mảng `[method, /regex/, handler]`. Lời chúc mới `unshift`, cắt còn `LIMITS.maxWishes`. `id` từ `randomId()` (mặc định `crypto.randomUUID().replace(/-/g,'').slice(0,10)`). Thời gian `now().toISOString()`.
- [ ] **Step 4:** Chạy lại → PASS.
- [ ] **Step 5:** Commit `feat: API công khai cho khách, xác nhận, lời chúc, cảm xúc`.

---

### Task 6: API quản lí

**Files:** Create `server/handlers/admin.js`, Modify `server/router.js`; Test `tests/api-admin.test.js`

**Interfaces:**
- Consumes: `uniqueSlug` (Task 2), router (Task 5).
- Produces route quản lí theo bảng mục 4.4 của spec. Xác thực: header `Authorization: Bearer <mk>`, so sánh bằng `crypto.timingSafeEqual` trên SHA-256 của hai chuỗi; `adminPassword` rỗng → 503 `'Chưa đặt mật khẩu quản lí'`; sai → 401 `'Sai mật khẩu'`.
- `POST /api/admin/guests` trả `{ created: Guest[] }` với `Guest` đủ trường spec 4.3 (`openCount: 0`, `firstOpenedAt: null`, `lastOpenedAt: null`, `rsvp: null`).

- [ ] **Step 1: Test**
```js
const auth = { authorization: 'Bearer bi-mat' }
test('thiếu/sai mật khẩu, chưa đặt mật khẩu', async () => {
  expect((await call(r, 'GET', '/api/admin/overview')).status).toBe(401)
  expect((await call(r, 'GET', '/api/admin/overview', null, { authorization: 'Bearer x' })).status).toBe(401)
  const r2 = createRouter({ store: createMemoryStore(), adminPassword: '' })
  expect((await call(r2, 'GET', '/api/admin/overview', null, auth)).status).toBe(503)
})
test('thêm hàng loạt: tên trùng nhau và trùng khách cũ ra slug khác nhau', async () => {
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Minh Anh' }] }, auth)
  const res = await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Minh Anh', title: 'Chị' }, { name: 'minh anh' }] }, auth)
  expect(res.body.created.map(g => g.slug)).toEqual(['minh-anh-2', 'minh-anh-3'])
  expect(res.body.created[0]).toMatchObject({ title: 'Chị', openCount: 0, rsvp: null })
})
test('thêm khách không hợp lệ', async () => {
  expect((await call(r, 'POST', '/api/admin/guests', { guests: [] }, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', { guests: [{ name: '' }] }, auth)).status).toBe(400)
  expect((await call(r, 'POST', '/api/admin/guests', { guests: Array(201).fill({ name: 'A' }) }, auth)).status).toBe(400)
})
test('sửa giữ nguyên slug, xoá khách, xoá lời chúc', async () => {
  await call(r, 'POST', '/api/admin/guests', { guests: [{ name: 'Vy' }] }, auth)
  const p = await call(r, 'PATCH', '/api/admin/guests/vy', { name: 'Tường Vy', title: 'Em', note: 'Nhớ đến nha' }, auth)
  expect(p.body).toMatchObject({ slug: 'vy', name: 'Tường Vy', title: 'Em', note: 'Nhớ đến nha' })
  expect((await call(r, 'DELETE', '/api/admin/guests/vy', null, auth)).status).toBe(204)
  expect((await call(r, 'GET', '/api/guests/vy')).status).toBe(404)
  expect((await call(r, 'PATCH', '/api/admin/guests/vy', { name: 'X' }, auth)).status).toBe(404)
  const w = await call(r, 'POST', '/api/wishes', { name: 'A', message: 'hi', emoji: '🎓' })
  expect((await call(r, 'DELETE', `/api/admin/wishes/${w.body.id}`, null, auth)).status).toBe(204)
  expect((await call(r, 'GET', '/api/wishes')).body.wishes).toHaveLength(0)
})
test('overview trả đủ dữ liệu, lời chúc có slug', async () => {
  const o = await call(r, 'GET', '/api/admin/overview', null, auth)
  expect(Object.keys(o.body).sort()).toEqual(['guests', 'reactions', 'rsvps', 'wishes'])
})
```
- [ ] **Step 2:** `npx vitest run tests/api-admin.test.js` → FAIL.
- [ ] **Step 3:** Cài đặt; tạo hàng loạt trong một lần `update` (Set slug đã dùng cập nhật dần).
- [ ] **Step 4:** Chạy `npm test` → tất cả PASS.
- [ ] **Step 5:** Commit `feat: API quản lí khách và lời chúc có mật khẩu`.

---

### Task 7: Nối API vào Netlify và Vite dev

**Files:** Create `netlify/functions/api.mjs`, `vite-plugin-api.js`; Modify `vite.config.js`, `netlify.toml`

**Interfaces:**
- Consumes: `createRouter`, `createBlobsStore`, `createFileStore`.
- Produces: `apiPlugin(): VitePlugin` — middleware: `/quan-li` → 302 `/quan-li/`; `/api/*` → router (store file `.data/`, mật khẩu `ADMIN_PASSWORD` từ `loadEnv` hoặc `'thiep-dev'` kèm log `[thiep] Mật khẩu quản lí khi dev: thiep-dev`).

- [ ] **Step 1:** `api.mjs`: `export default async (req) => router(req)` với router tạo lười một lần, store = `createBlobsStore(getStore({ name: 'thiep', consistency: 'strong' }))`, mật khẩu `Netlify.env.get('ADMIN_PASSWORD') ?? ''`.
- [ ] **Step 2:** `netlify.toml`: `[build] command="npm run build" publish="dist"`, `[functions] directory="netlify/functions"`, redirect `/api/*` → `/.netlify/functions/api/:splat` 200, rồi `/*` → `/index.html` 200.
- [ ] **Step 3:** `vite-plugin-api.js`: chuyển Node req → `Request` (đọc body thành Buffer, giữ headers), ghi `Response` về res (status, headers, body). Thêm vào `vite.config.js`.
- [ ] **Step 4:** Chạy `npm run dev` (nền), rồi kiểm tra:
  `curl -s -X POST localhost:5173/api/admin/guests -H "authorization: Bearer thiep-dev" -H "content-type: application/json" -d "{\"guests\":[{\"name\":\"Tiến Quốc\",\"title\":\"Anh\"}]}"` → Expected: JSON có `"slug":"tien-quoc"`.
  `curl -s localhost:5173/api/guests/tien-quoc` → Expected: `{"name":"Tiến Quốc","title":"Anh",...}`; `curl -sI localhost:5173/quan-li` → `302`.
- [ ] **Step 5:** Commit `feat: nối API vào Netlify Functions và Vite dev`.

---

### Task 8: Khung trang thiệp, nền trời, nhạc

**Files:** Create `src/lib/api.js`, `src/lib/dom.js`, `src/fx/sky.js`, `src/fx/reveal.js`, `src/sections/music.js`, `src/styles/sky.css`, `src/styles/sections.css` (khung chung các section), Modify `src/main.js`, `index.html`

**Interfaces:**
- Consumes: `parseRoute`, `displayName` (Task 3); API Task 5.
- Produces (`api.js`): `ApiError { status, message }`; `api = { getGuest(slug), markOpened(slug), sendRsvp({slug?, name?, attending}), getWishes(), sendWish({name, message, emoji, slug?, website}), sendReactions(counts) }`; `createAdminApi(password) = { overview(), addGuests(guests), updateGuest(slug, patch), deleteGuest(slug), deleteWish(id) }`. Lỗi mạng → `ApiError(0, 'Không kết nối được, bạn kiểm tra mạng nhé')`.
- Produces (`dom.js`): `h(tag, props?, ...children): HTMLElement` (props `class`, `text`, `attrs`, `on`), `toast(message, kind = 'info')`, `prefersReducedMotion(): boolean`.
- Produces (`main.js`): `ctx = { content, route, guest, displayName, api, reducedMotion, fx: { burst, floatEmoji }, onOpen(cb) }`; `mountSection(id, renderFn)` gọi `renderFn(rootEl, ctx)` trong try/catch, lỗi → ẩn section + `console.error`. `fx.burst`/`fx.floatEmoji` là hàm rỗng cho tới Task 9/12.
- Produces (`sky.js`): `initSky(): void` — 3 lớp trời cố định (sáng/trưa/hoàng hôn) đổi opacity theo % cuộn (scroll passive + rAF), 3 lớp mây SVG trôi bằng CSS keyframes, dừng khi `document.hidden`.
- Produces (`reveal.js`): `initReveal(root)` — phần tử `[data-reveal]` nhận class `is-in` khi vào màn hình (IntersectionObserver, `threshold 0.15`, chỉ một lần); con có `--i` để trễ lần lượt.
- Produces (`music.js`): `createMusic(content.music): { start(): Promise<void>, toggle(), el }` — nút tròn cố định dưới trái, đĩa quay khi phát, tăng âm lượng 0→0.6 trong 2 giây; `src` rỗng hoặc `error` → nút ẩn.

- [ ] **Step 1:** `main.js`: `parseRoute(location)` → nếu có slug thì `api.getGuest` (lỗi → guest null); `onOpen` chạy khi bìa mở: `music.start()`, và nếu có slug + không preview → `api.markOpened(slug)` (bỏ qua lỗi). Thứ tự section: cover, hero, invite, schedule, venue, gallery, rsvp, wishes, contact, closing (module chưa có thì bỏ qua — thêm dần ở các task sau).
- [ ] **Step 2:** Viết `sky.js`, `reveal.js`, `music.js`, `dom.js`, `api.js` và CSS.
- [ ] **Step 3:** Kiểm tra trình duyệt (preview `thiep`, khổ 375×812): trời và mây hiện, cuộn đổi màu trời, không lỗi console; `music.src` rỗng → không có nút nhạc.
- [ ] **Step 4:** Commit `feat: khung trang thiệp, nền trời mây và nút nhạc`.

---

### Task 9: Bìa và chuỗi mở thiệp

**Files:** Create `src/sections/cover.js`, `src/fx/confetti.js`, `src/styles/cover.css`; Modify `src/main.js`

**Interfaces:**
- Consumes: `ctx.displayName`, `ctx.onOpen`, GSAP.
- Produces (`confetti.js`): `createConfetti(): { burst({ x, y, count = 120, caps = true }) }` — một canvas cố định toàn màn hình, DPR tối đa 2, hạt giấy màu (xanh trời, trắng, vàng) + mũ tốt nghiệp vẽ bằng path, trọng lực + lực cản, rAF dừng khi hết hạt, tối đa ~140 hạt đang bay. Gán vào `ctx.fx.burst`.
- Produces (`cover.js`): `renderCover(root, ctx)` — dựng bìa theo spec 2.2 (máy bay giấy bay theo đường cong vào, thả phong bì; phong bì có dấu sáp mũ tốt nghiệp, "Thư mời tốt nghiệp · Lý Ngọc Thắm", "Thân gửi" + `ctx.displayName`, nút **Mở thiệp**). Khoá cuộn `document.documentElement.classList.add('is-locked')` cho tới khi mở. Bấm nút hoặc dấu sáp → timeline GSAP: dấu sáp phóng to + mờ → nắp lật (rotateX) → thiệp trồi lên → hai dải mây tiền cảnh trượt ra hai bên + bìa mờ → gỡ khoá cuộn, `burst` từ giữa màn hình, gọi các callback `onOpen`. Tổng ≤ 2.5 giây. Reduced-motion: chỉ mờ bìa 0.4 giây, không máy bay.

- [ ] **Step 1:** Viết `confetti.js`, `cover.js`, `cover.css`.
- [ ] **Step 2:** Kiểm tra trình duyệt: mở `/` thấy "Thân gửi bạn"; tạo khách `tien-quoc` (curl Task 7) và mở `/tien-quoc` thấy "Thân gửi Anh Tiến Quốc"; bấm Mở thiệp → hiệu ứng chạy, cuộn được, `openCount` tăng (curl overview); mở `/tien-quoc?xem-thu=1` → `openCount` không tăng. Đo trong DevTools Performance nếu có giật.
- [ ] **Step 3:** Commit `feat: bìa phong bì, máy bay giấy và hiệu ứng mở thiệp`.

---

### Task 10: Các phần nội dung của thiệp

**Files:** Create `src/sections/hero.js`, `invite.js`, `schedule.js`, `venue.js`, `gallery.js`, `contact.js`, `closing.js` và CSS tương ứng trong `src/styles/`; Modify `src/main.js`

**Interfaces:**
- Consumes: `time.js` (Task 3), `ctx`, `h`, `initReveal`.
- Produces: mỗi file export `render(root, ctx)`; nội dung theo spec 2.3 mục 1–5, 8, 9:
  - `hero`: tên `graduate.fullName` hiện từng chữ (mỗi chữ một `span` với `--i`), ảnh `photos.hero` trong khung vòm hoặc minh hoạ SVG mây + mũ + "Thắm".
  - `invite`: `texts.inviteLead` + `ctx.displayName` + `texts.inviteBody`; nếu `guest.note` → thẻ viết tay (font Great Vibes cho lời chào, nội dung bằng `textContent`).
  - `schedule`: dòng ngày giờ (`weekdayVi`, `formatDateDots`, `10:00 sáng`), lưới `monthGrid(2026, 11)` đánh dấu 26, đếm ngược cập nhật mỗi giây (chỉ khi section trong màn hình), số đổi có hiệu ứng lật; đổi nội dung theo `eventPhase`; nút Google Calendar (`googleCalendarUrl`) và "Tải về lịch (.ics)" (`buildIcs` → Blob download `le-tot-nghiep-tham.ics`); `event.note` nếu có.
  - `venue`: tên + địa chỉ; `mapQuery` có → iframe `https://www.google.com/maps?q=<encoded>&output=embed` gắn khi IntersectionObserver `rootMargin: '100% 0px'`, `loading="lazy"`, `title` có chữ; nút Chỉ đường (`directionsUrl` hoặc `https://www.google.com/maps/dir/?api=1&destination=<encoded>`); thiếu → "Địa điểm sẽ được cập nhật sớm".
  - `gallery`: rỗng → ẩn section; có ảnh → dải polaroid lơ lửng (`loading="lazy"`), bấm mở lớp xem ảnh (Esc / bấm nền để đóng, phím ←/→).
  - `contact`: nút `tel:`, `https://zalo.me/<số>`, `https://m.me/<id>`; nút trống ẩn, cả mục trống ẩn.
  - `closing`: `texts.closing`, chữ ký "Thắm" (Great Vibes), máy bay giấy bay xa khi vào màn hình.

- [ ] **Step 1:** Viết các section và CSS; gắn vào `main.js`.
- [ ] **Step 2:** Kiểm tra trình duyệt 375×812 và 1280×800: thứ tự đúng, "Thứ Năm · 26.11.2026", lịch đánh dấu 26, đếm ngược chạy; điền tạm `venue.mapQuery` để thấy bản đồ rồi trả lại rỗng; link Google Calendar mở đúng giờ; không tràn ngang; không lỗi console.
- [ ] **Step 3:** Commit `feat: hero, lời mời, thời gian, địa điểm, album, liên hệ, lời kết`.

---

### Task 11: Xác nhận tham dự

**Files:** Create `src/sections/rsvp.js`, `src/styles/rsvp.css`; Modify `src/main.js`

**Interfaces:**
- Consumes: `api.sendRsvp`, `ctx.guest`, `ctx.fx.burst`.
- Produces: `render(root, ctx)` theo spec 2.3 mục 6. Link riêng: trạng thái ban đầu từ `guest.rsvp`. Link chung: ô tên (bắt buộc khi gửi), trạng thái nhớ ở `localStorage['thiep:rsvp']` (bọc try/catch). Đang gửi → nút khoá; thành công → lời cảm ơn ("Hẹn gặp bạn ngày 26/11 nha! 🎓" / "Tiếc quá, cảm ơn bạn đã báo nha 💙") + `burst` nhỏ khi chọn đến; lỗi → `toast` lỗi, giữ lựa chọn cũ.

- [ ] **Step 1:** Viết section.
- [ ] **Step 2:** Kiểm tra: `/tien-quoc` chọn "Mình sẽ đến" → tải lại trang vẫn hiện đã chọn; overview có `rsvp.attending: true`; `/` gửi không tên → nhắc nhập tên; gửi có tên → có trong `rsvps`.
- [ ] **Step 3:** Commit `feat: xác nhận tham dự`.

---

### Task 12: Sổ lời chúc và cảm xúc bay

**Files:** Create `src/sections/wishes.js`, `src/fx/floaters.js`, `src/styles/wishes.css`; Modify `src/main.js`

**Interfaces:**
- Consumes: `api.getWishes/sendWish/sendReactions`, `REACTIONS`, `WISH_EMOJIS`, `LIMITS`, `formatWishTime`, `content.wishSuggestions`, `ctx.fx.burst`.
- Produces (`floaters.js`): `floatEmoji(emoji: string, { x, y }): void` — phần tử cố định, CSS animation 1.6–2.4 giây với `--dx` (−60…60px), `--rot` (−25…25°), `--rise` (45–75% chiều cao màn hình) ngẫu nhiên; tối đa 40 phần tử cùng lúc (vượt thì bỏ qua); xoá khi `animationend`. Gán vào `ctx.fx.floatEmoji`.
- Produces (`wishes.js`): `render(root, ctx)` theo spec 2.4:
  - Form: tên điền sẵn `guest.name`, textarea + bộ đếm `n/500`, nút 💡 (gợi ý ngẫu nhiên khác lần trước), 6 nút chọn emoji (mặc định 🎓, `aria-pressed`), ô bẫy `website` ẩn (`tabindex=-1`, `autocomplete=off`), nút Gửi (khoá khi đang gửi).
  - Gửi xong: chèn thẻ mới đầu danh sách có hiệu ứng, xoá textarea, 10 `floatEmoji` emoji đã chọn từ nút gửi. Lỗi: `toast`, giữ nội dung.
  - Danh sách: thẻ (tên, emoji, `formatWishTime`, nội dung `textContent` với `white-space: pre-line`), khung cuộn `max-height: 70vh`; rỗng → "Hãy là người đầu tiên gửi lời chúc 💙"; lỗi tải → thông báo + nút Thử lại.
  - Thanh cảm xúc: 6 nút có số đếm; `pointerdown` → bay 1 emoji, giữ → lặp mỗi 125 ms tới `pointerup/leave/cancel`; cộng vào `pending`, gửi sau 1.5 giây không bấm (mỗi loại cắt ở 60, phần dư để lần sau); lỗi → giữ `pending` để gửi lại.
  - Cập nhật 15 giây: chỉ khi `!document.hidden` và section đã từng hiện; so tổng mới với tổng đã biết (đã cộng `pending` của mình) → chênh lệch dương của mỗi loại → bay tối đa 12 emoji từ các vị trí ngẫu nhiên đáy section; lời chúc có `id` chưa có → chèn đầu.

- [ ] **Step 1:** Viết `floaters.js`, `wishes.js`, CSS.
- [ ] **Step 2:** Kiểm tra trình duyệt: gửi lời chúc có `<b>` → hiện nguyên chữ `<b>`; xuống dòng giữ nguyên; bấm giữ ❤️ → tim bay liên tục, số tăng, sau 1.5 giây `POST /api/reactions` (xem network); mở tab thứ hai thả 🎉 → trong ≤ 15 giây tab đầu thấy 🎉 bay và số tăng; lời chúc gửi từ tab hai xuất hiện ở tab một.
- [ ] **Step 3:** Commit `feat: sổ lời chúc, cảm xúc bay và cập nhật live`.

---

### Task 13: Trang quản lí

**Files:** Create `src/admin/main.js` (thay stub), `src/admin/login.js`, `src/admin/guests.js`, `src/admin/wishes.js`, `src/styles/admin.css`; Modify `quan-li/index.html`

**Interfaces:**
- Consumes: `createAdminApi` (Task 8), `fillTemplate`, `displayName`, `stripDiacritics`, `h`, `toast`, `content.texts.shareTemplate`.
- Produces: trang theo spec mục 3.
  - `login.js`: `renderLogin(root, onSuccess(password))` — thử `overview()`; 401 → "Sai mật khẩu"; 503 → hiện thông báo máy chủ. Lưu `sessionStorage['thiep:admin']`.
  - `guests.js`: thống kê; form thêm 1 khách (datalist xưng hô: Anh, Chị, Em, Bạn, Cô, Chú, Thầy, Gia đình); thêm hàng loạt (mỗi dòng `Tên` hoặc `Xưng hô | Tên`, bỏ dòng trống); kết quả tạo hiện link + Copy link / Copy kèm lời mời / Chia sẻ (`navigator.share` có mới hiện); danh sách + tìm kiếm không dấu; nhãn trạng thái; Sửa (form tại chỗ), Xoá (`confirm`), Xem thử (`/<slug>?xem-thu=1` tab mới); bảng xác nhận từ link chung.
  - `wishes.js`: danh sách lời chúc + Xoá (`confirm`).
  - Link khách = `${location.origin}/${slug}`; lời mời = `fillTemplate(shareTemplate, { ten: displayName(guest), link })`. Copy dùng `navigator.clipboard.writeText`, lỗi → chọn sẵn chữ trong ô để người dùng tự copy.
  - Nút Làm mới + tự làm mới khi quay lại tab; nút Đăng xuất (xoá `sessionStorage['thiep:admin']`, về màn đăng nhập).

- [ ] **Step 1:** Viết các file.
- [ ] **Step 2:** Kiểm tra trình duyệt: sai mật khẩu báo lỗi; đúng `thiep-dev` vào được; thêm "Tiến Quốc" xưng hô "Anh" → link `/tien-quoc`; thêm hàng loạt 3 dòng (có 1 dòng trùng tên) → 3 link khác nhau; mở link khách (không xem thử) rồi Làm mới → "Đã mở 1 lần"; tìm "quoc" ra "Tiến Quốc"; sửa, xoá khách, xoá lời chúc hoạt động; khổ 375 không tràn ngang.
- [ ] **Step 3:** Commit `feat: trang quản lí khách, link mời và lời chúc`.

---

### Task 14: Ảnh xem trước, README, kiểm tra cuối

**Files:** Create `public/og.png` (1200×630, sinh từ `scripts/og.svg` bằng sharp chạy một lần, không thêm sharp vào dependencies), `scripts/og.svg`, `public/favicon.svg`, `README.md`; Modify `index.html` (thẻ Open Graph theo spec 2.5)

- [ ] **Step 1:** Ảnh OG: trời xanh + mây + "Thư mời tốt nghiệp" + "Lý Ngọc Thắm" + "Thứ Năm · 26.11.2026 · 10:00". Favicon mũ tốt nghiệp xanh.
- [ ] **Step 2:** README tiếng Việt: chạy trên máy, điền `content.js` (trường, bản đồ, nhạc vào `public/nhac/`, ảnh vào `public/anh/`, liên hệ), đặt `ADMIN_PASSWORD` (`.env.local` khi dev; `npx netlify env:set ADMIN_PASSWORD "..."` trên Netlify), deploy lần đầu và các lần sau, cách gửi link, lưu ý riêng tư.
- [ ] **Step 3:** `npm test` → tất cả PASS. `npm run build` → PASS; kiểm tra tổng JS trang thiệp gzip ≤ 90 KB (`gzip -c dist/assets/main-*.js | wc -c`).
- [ ] **Step 4:** Kiểm tra trình duyệt toàn bộ luồng (spec mục 7) ở 375×812 và 1280×800, cả chế độ giảm chuyển động (giả lập bằng DevTools hoặc `matchMedia`); không lỗi console.
- [ ] **Step 5:** Commit `docs: README, ảnh xem trước và favicon`.
