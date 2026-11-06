# Tab Cài đặt trong trang quản lí — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người gửi thiệp sửa giờ, địa điểm, tên, lời văn, nhạc, liên hệ ngay trong trang quản lí; khách mở thiệp thấy ngay, không cần deploy.

**Architecture:** Danh sách ô sửa được nằm ở `shared/settings.js` (dùng chung cho thiệp, trang quản lí, máy chủ) cùng hàm lấy và ghép nội dung. Máy chủ kiểm tra và lưu cài đặt vào Netlify Blobs khoá `config`. Thiệp tải cài đặt lúc mở (chờ tối đa 2,5 giây), ghép với `content.js` rồi dựng mọi phần từ nội dung đã ghép.

**Tech Stack:** Vite 8, JS thuần ES modules, Netlify Functions v2 + Blobs, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-11-07-cai-dat-trong-quan-li-design.md`

## Global Constraints

- Chữ hiển thị và thông báo lỗi bằng tiếng Việt có dấu.
- Không thêm thư viện mới.
- Mọi chữ người dùng nhập hiển thị bằng `textContent` (hàm `h(..., { text })`), không chèn HTML.
- Giờ theo Việt Nam (UTC+7), dùng các hàm trong `src/lib/time.js`.
- Thời gian chờ cài đặt ở thiệp: 2500 ms; quá hạn hoặc lỗi thì dùng `content.js`.
- `music.src` (mp3) không nằm trong cài đặt và luôn được ưu tiên hơn link.
- Test chạy bằng `npx vitest run`; toàn bộ phải đạt trước mỗi commit.

## Review Focus

1. Cài đặt đã lưu thiếu một ô (lưu từ bản cũ, hoặc ô mới thêm sau) → ô đó dùng giá trị trong `content.js`, không thành trống.
2. Link chỉ đường dạng `javascript:...` hoặc không có `http(s)://` → bị từ chối (link này được gắn vào thẻ `<a>`).
3. Chữ có dấu tiếng Việt, emoji, nhiều dòng trong lời mời/lời kết → lưu và đọc lại đúng nguyên văn (chuẩn NFC, giữ xuống dòng).
4. `/api/config` lỗi, chậm hoặc trả HTML → thiệp vẫn mở với nội dung gốc sau tối đa 2,5 giây.
5. Đang sửa dở form Cài đặt mà quay lại tab trình duyệt (tự làm mới) → form không bị xoá.

---

### Task 1: Danh sách ô sửa được, lấy và ghép nội dung

**Files:**
- Create: `shared/settings.js`
- Test: `tests/settings.test.js`

**Interfaces:**
- Produces:
  - `SETTINGS_GROUPS: { title: string, fields: Field[] }[]` — 4 nhóm theo đúng bảng trong spec, đúng thứ tự.
  - `Field = { path: 'event.date', label: string, kind: 'text'|'multiline'|'date'|'time'|'url'|'youtube'|'spotify'|'phone', required?: boolean, max?: number, hint?: string }`.
  - `SETTINGS_FIELDS: Field[]` — mọi ô, phẳng.
  - `getPath(obj, path) → any`, `setPath(obj, path, value)`.
  - `pickSettings(content) → settings` — lấy đúng các ô sửa được, dạng lồng `{ event: { date, ... }, venue: {...}, ... }`; ô thiếu trong content → `''`.
  - `mergeSettings(content, settings) → content mới` — bản sao sâu của `content`; ô nào trong `settings` là chuỗi (kể cả `''`) thì thay; không có hoặc không phải chuỗi thì giữ mặc định. Không đụng các khoá ngoài danh sách (vd. `wishSuggestions`, `photos`, `music.src`).

- [ ] **Step 1: Viết test hỏng** trong `tests/settings.test.js`:
  - `SETTINGS_FIELDS` có đủ 21 ô của bảng spec (so sánh danh sách `path`), không trùng.
  - `pickSettings(content)` (content mẫu trong test) trả `event.date === '2026-11-26'`, `music.youtube` đúng, và không có `photos`.
  - `mergeSettings(content, { event: { start: '14:00' } })` → `event.start === '14:00'`, `event.end` giữ `'12:00'`, `venue.name` giữ nguyên; `content` gốc không bị đổi.
  - `mergeSettings(content, { event: { note: '' } })` → `event.note === ''` (chuỗi rỗng được dùng).
  - `mergeSettings(content, { event: { start: 9 }, la: { x: 'y' } })` → `event.start` giữ mặc định, không có khoá `la`.
  - `mergeSettings(content, {})` và `mergeSettings(content, undefined)` → bằng `content`.
- [ ] **Step 2:** `npx vitest run tests/settings.test.js` — Expected: FAIL (không tìm thấy `shared/settings.js`).
- [ ] **Step 3:** Viết `shared/settings.js` theo Interfaces. `hint` cho ô mẫu tin nhắn: `'Dùng {ten}, {link}, {ngay}, {gio} để tự điền tên khách, link thiệp, ngày và giờ.'`; ô chữ tìm bản đồ: `'Để trống thì ẩn bản đồ.'`; ô Zalo: `'Số điện thoại dùng Zalo.'`.
- [ ] **Step 4:** `npx vitest run tests/settings.test.js` — Expected: PASS.
- [ ] **Step 5:** Commit `feat: danh sách ô cài đặt, lấy và ghép nội dung`.

### Task 2: Kiểm tra và API cài đặt

**Files:**
- Create: `server/settings.js`
- Modify: `server/handlers/public.js` (thêm `EMPTY.config`, route `GET /config`)
- Modify: `server/handlers/admin.js` (route `PUT /admin/config`, `DELETE /admin/config`)
- Test: `tests/api-config.test.js`

**Interfaces:**
- Consumes: `SETTINGS_FIELDS`, `setPath`, `getPath` (Task 1); `cleanText` (`server/validate.js`); `youtubeInfo` (`src/lib/youtube.js`), `spotifyInfo` (`src/lib/spotify.js`); `update`, `load`.
- Produces:
  - `validateSettings(input) → settings` (lồng, đã làm sạch) hoặc ném `HttpError(400, message)`.
  - `GET /api/config` → `200 { settings }` (chưa lưu → `{}`).
  - `PUT /api/admin/config` body `{ settings }` → `200 { settings }`; lưu `{ settings, updatedAt }` vào khoá `config`.
  - `DELETE /api/admin/config` → `204`; lưu `{ settings: {}, updatedAt }` (store không có lệnh xoá, ghi rỗng tương đương "chưa lưu").

Quy tắc `validateSettings` (ô thiếu coi là `''`):
- `text`/`multiline`: `cleanText(v, { label, min: required ? 1 : 0, max, multiline })`.
- `date`: khớp `^\d{4}-\d{2}-\d{2}$` và là ngày có thật → sai: `"Ngày không hợp lệ"`.
- `time`: khớp `^([01]\d|2[0-3]):[0-5]\d$` → sai: `"<label> không hợp lệ"`; sau đó `end > start` → sai: `"Giờ kết thúc phải sau giờ bắt đầu"`.
- `url`: trống, hoặc khớp `^https?:\/\/\S+$`, ≤ 500 → sai: `"Link chỉ đường phải bắt đầu bằng http:// hoặc https://"`.
- `youtube`/`spotify`: trống, hoặc `youtubeInfo`/`spotifyInfo` đọc được → sai: `"Link YouTube không đúng"` / `"Link Spotify không đúng"`.
- `phone`: trống, hoặc chỉ gồm chữ số, `+`, dấu cách, `.` và có 8–15 chữ số → sai: `"<label> không hợp lệ (8–15 chữ số)"`.
- Mẫu tin nhắn phải chứa `{link}` → sai: `"Mẫu tin nhắn phải có {link} để khách nhận được link thiệp"`.

- [ ] **Step 1: Viết test hỏng** trong `tests/api-config.test.js` (dùng `createMemoryStore`, `call`, mật khẩu `bi-mat`; dựng `valid()` = `pickSettings(content)` từ `content.js`):
  - `GET /api/config` khi chưa lưu → `200 { settings: {} }`.
  - `PUT` thiếu mật khẩu → `401`; `DELETE` thiếu mật khẩu → `401`.
  - `PUT valid()` với `event.start: '14:00'`, `event.end: '16:30'`, `texts.closing: 'Cảm ơn mọi người 💙\nHẹn gặp nhé'` → `200`; `GET` trả đúng các giá trị đó (xuống dòng giữ nguyên).
  - `PUT` có khoá lạ `settings.la = { x: 1 }` → lưu thành công, `GET` không có `la`.
  - Lỗi `400` kèm đúng câu: ngày `'2026-02-30'`; giờ `'9:00'`; `end` `'09:00'` khi `start` `'10:00'`; `directionsUrl` `'javascript:alert(1)'`; youtube `'https://example.com/x'`; phone `'12ab'`; `shareTemplate` không có `{link}`; `fullName` `'  '` → `"Bạn chưa nhập tên hiển thị"`.
  - Các ô "được để trống" (`event.note`, `venue.mapQuery`, `music.youtube`, `contact.phone`) gửi `''` → `200`.
  - `DELETE` sau khi lưu → `204`, rồi `GET` → `{ settings: {} }`.
- [ ] **Step 2:** `npx vitest run tests/api-config.test.js` — Expected: FAIL (`GET /api/config` trả 404).
- [ ] **Step 3:** Viết `server/settings.js` và thêm 3 route theo Interfaces.
- [ ] **Step 4:** `npx vitest run` — Expected: PASS toàn bộ.
- [ ] **Step 5:** Commit `feat: API lưu và đọc cài đặt thiệp`.

### Task 3: Ngày giờ dạng chữ và tin nhắn gửi khách

**Files:**
- Modify: `src/lib/time.js` (thêm `timeOfDay`, `longDateVi`)
- Modify: `src/lib/text.js` (thêm `inviteMessage`)
- Modify: `src/sections/schedule.js` (dùng `timeOfDay` thay hàm `timeLabel` nội bộ)
- Modify: `src/admin/share.js` (`inviteText(guest, content)`, `shareInvite(guest, content)` dùng `inviteMessage`)
- Modify: `content.js` (mẫu tin nhắn mặc định + chú thích)
- Test: `tests/time.test.js`, `tests/text.test.js`

**Interfaces:**
- Produces:
  - `timeOfDay('10:00') → '10:00 sáng'` (`< 11` sáng, `< 13` trưa, `< 18` chiều, còn lại tối — giữ đúng quy tắc của `timeLabel` hiện tại).
  - `longDateVi(date) → 'Thứ Năm, 26/11/2026'`.
  - `inviteMessage({ template, name, link, event }) → string` — điền `{ten}`, `{link}`, `{ngay}` = `longDateVi(eventRange(event).start)`, `{gio}` = `timeOfDay(event.start)`.
  - `inviteText(guest, content)`, `shareInvite(guest, content)` trong `src/admin/share.js`.

- [ ] **Step 1: Viết test hỏng:** `timeOfDay('10:00') === '10:00 sáng'`, `'12:30'` → `'12:30 trưa'`, `'14:00'` → `'14:00 chiều'`, `'19:00'` → `'19:00 tối'`; `longDateVi(eventRange({ date: '2026-11-26', start: '10:00', end: '12:00' }).start) === 'Thứ Năm, 26/11/2026'`; `inviteMessage({ template: 'Mời {ten} lúc {gio} {ngay}: {link}', name: 'Vy', link: 'https://x/vy', event: { date: '2026-11-26', start: '14:00', end: '16:00' } }) === 'Mời Vy lúc 14:00 chiều Thứ Năm, 26/11/2026: https://x/vy'`.
- [ ] **Step 2:** `npx vitest run tests/time.test.js tests/text.test.js` — Expected: FAIL (hàm chưa có).
- [ ] **Step 3:** Thêm các hàm; `schedule.js` dùng `timeOfDay`; `share.js` nhận `content`; mẫu mặc định trong `content.js`: `'Thắm trân trọng mời {ten} đến dự lễ tốt nghiệp của Thắm lúc {gio} {ngay} 🎓\nThiệp mời: {link}'`, chú thích liệt kê `{ten}`, `{link}`, `{ngay}`, `{gio}`. Chỗ gọi `inviteText`/`shareInvite` trong `src/admin/guests.js` truyền `state.content` (Task 5 tạo `state.content`; tạm thời truyền `content` import từ `content.js` để build vẫn chạy).
- [ ] **Step 4:** `npx vitest run` — Expected: PASS toàn bộ.
- [ ] **Step 5:** Commit `feat: mẫu tin nhắn tự điền ngày giờ`.

### Task 4: Thiệp dùng cài đặt

**Files:**
- Create: `src/lib/load-settings.js`
- Modify: `src/lib/api.js` (`api.getConfig()`)
- Modify: `src/main.js`
- Modify: `src/sections/cover.js` (dòng "Thiệp có nhạc nền" tính cả `music.youtube`)
- Test: `tests/load-settings.test.js`

**Interfaces:**
- Consumes: `mergeSettings` (Task 1), `GET /api/config` (Task 2), `withTimeout` (`src/lib/async.js`).
- Produces:
  - `loadSettings(getConfig, ms = 2500) → Promise<settings>` — không bao giờ ném lỗi: trả `res.settings` nếu là object, còn lại (lỗi, quá hạn, dữ liệu sai) trả `{}`.
  - `ctx.content` = nội dung đã ghép; mọi phần đọc từ `ctx.content`.

- [ ] **Step 1: Viết test hỏng** `tests/load-settings.test.js`: `getConfig` trả `{ settings: { event: { start: '14:00' } } }` → trả đúng object đó; `getConfig` ném `ApiError` (như khi `/api` trả HTML) → `{}`; trả `{ settings: 'x' }` hoặc `null` → `{}`; `getConfig` không bao giờ xong (fake timers, tiến 2500 ms) → `{}`.
- [ ] **Step 2:** `npx vitest run tests/load-settings.test.js` — Expected: FAIL (chưa có file).
- [ ] **Step 3:** Viết `loadSettings`; `api.getConfig = () => request('GET', '/config')`. Trong `boot()`: bắt đầu tải tên khách trước, rồi `const content = mergeSettings(baseContent, await loadSettings(api.getConfig))`; dùng `content` này cho `ctx.content` và `createMusic(content.music, ...)`. Bìa và nhạc dựng sau khi có `content`. `cover.js`: hiện dòng nhạc khi `music.src || music.youtube || music.spotify`.
- [ ] **Step 4:** `npx vitest run` — Expected: PASS toàn bộ.
- [ ] **Step 5:** Kiểm tra trên máy chủ dev: dùng `fetch` với `Bearer thiep-dev` gọi `PUT /api/admin/config` đổi `event.start` thành `'14:00'`, `event.end` thành `'16:00'`, `venue.name` thành `'Hội trường thử'`; tải lại thiệp → phần Thời gian ghi `14:00 chiều`, phần Địa điểm ghi `Hội trường thử`, không lỗi console. Gọi `DELETE /api/admin/config` → tải lại thấy `10:00 sáng`.
- [ ] **Step 6:** Commit `feat: thiệp đọc cài đặt từ trang quản lí`.

### Task 5: Tab Cài đặt trong trang quản lí

**Files:**
- Create: `src/admin/settings.js`
- Modify: `src/lib/api.js` (`createAdminApi`: `getConfig`, `saveConfig(settings)`, `resetConfig()`)
- Modify: `src/admin/main.js` (tải cài đặt cùng lúc với tổng quan; `state.settings`, `state.content`, `state.refreshHead()`; thêm tab `['settings', 'Cài đặt', renderSettingsTab]` sau Lời chúc)
- Modify: `src/admin/guests.js` (truyền `state.content` cho `inviteText`/`shareInvite`)
- Modify: `src/styles/admin.css`

**Interfaces:**
- Consumes: `SETTINGS_GROUPS`, `pickSettings`, `mergeSettings`, `getPath`, `setPath` (Task 1); API (Task 2).
- Produces: `renderSettingsTab(root, state) → { update({ background }) }`, cùng dạng với các tab khác.

Hành vi:
- Form chia 4 `fieldset` theo `SETTINGS_GROUPS`; mỗi ô có nhãn, `hint` (nếu có); `kind` → `input[type=date]`, `input[type=time]`, `textarea` (multiline), `input[type=url]` (url/youtube/spotify), `input[type=tel]` (phone), còn lại `input[type=text]`; `maxLength = max`.
- Giá trị ban đầu: `pickSettings(state.content)`.
- **Lưu**: gom form thành `settings` lồng → `saveConfig` → `state.settings = res.settings`, `state.content = mergeSettings(content, res.settings)`, `state.refreshHead()`, toast `"Đã lưu, khách mở thiệp sẽ thấy ngay"`; lỗi → toast đúng câu máy chủ.
- **Khôi phục mặc định**: `confirm('Đưa mọi cài đặt về như ban đầu?')` → `resetConfig` → điền lại form từ `pickSettings(content)`.
- `update({ background: true })` khi form đã bị sửa (cờ `dirty` bật khi có sự kiện `input`) → không làm gì.
- Nút Lưu/Khôi phục nằm cuối form, dính đáy màn hình trên điện thoại.

- [ ] **Step 1:** Thêm API admin, `state.settings`/`state.content`/`refreshHead` trong `main.js` (dòng tiêu đề dùng `state.content`).
- [ ] **Step 2:** Viết `src/admin/settings.js` và style.
- [ ] **Step 3:** Kiểm tra trên trình duyệt (máy chủ dev, mật khẩu `thiep-dev`): đổi giờ bắt đầu 14:00, kết thúc 16:00, tên nơi "Hội trường thử" → Lưu → toast thành công, dòng tiêu đề không đổi tên; mở thiệp thấy giờ và địa điểm mới. Nhập giờ kết thúc 09:00 → toast "Giờ kết thúc phải sau giờ bắt đầu". Copy kèm lời mời ra đúng "14:00 chiều Thứ Năm, 26/11/2026". Khôi phục mặc định → form và thiệp về 10:00. Sửa dở một ô rồi phát sự kiện `visibilitychange` (giả lập quay lại tab) → ô vẫn giữ chữ đang sửa. Ở 375px không tràn ngang.
- [ ] **Step 4:** `npx vitest run` — Expected: PASS. Commit `feat: tab Cài đặt trong trang quản lí`.

### Task 6: Xem trước khi gửi link không ghi ngày giờ, README

**Files:**
- Modify: `index.html` (mô tả: `Trân trọng mời bạn đến dự lễ tốt nghiệp của Ngọc Thắm.`; `og:description` nếu có cũng vậy)
- Modify: `scripts/og.svg` (bỏ dòng ngày giờ, căn lại 2 dòng còn lại cho cân), `public/og.png` (vẽ lại bằng sharp)
- Modify: `README.md` (mục "Điền nội dung" nói thêm tab Cài đặt; bảng nội dung ghi rõ ô nào sửa được trong tab Cài đặt)

- [ ] **Step 1:** Sửa 3 file, vẽ lại `og.png`, xem ảnh: không còn ngày giờ.
- [ ] **Step 2:** `npx vitest run` và `npx vite build` — Expected: PASS, build thành công.
- [ ] **Step 3:** Commit `docs: xem trước link không ghi ngày giờ, hướng dẫn tab Cài đặt`, rồi `git push` (Netlify tự deploy). Kiểm tra bản thật: `GET https://ngocthamtn.netlify.app/api/config` trả `{"settings":{}}`.
