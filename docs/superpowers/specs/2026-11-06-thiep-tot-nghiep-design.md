# Thiệp mời tốt nghiệp Lý Ngọc Thắm — Thiết kế

Ngày: 2026-11-06 · Trạng thái: đã duyệt thiết kế trong chat, chờ duyệt bản viết

## 1. Mục tiêu

Một trang thiệp mời dự lễ tốt nghiệp của **Lý Ngọc Thắm**, tông **xanh da trời**, phong cách **"Bầu trời mây"**. Mỗi khách nhận một link riêng hiện đúng tên mình. Người gửi có trang quản lí để nhập tên, lấy link, theo dõi ai đã mở thiệp và ai sẽ đến. Khách để lại lời chúc và thả cảm xúc bay trên màn hình.

Lấy cảm hứng từ ivyinvi.com (bìa "Thân mời [tên]", nhạc, ngày giờ, lịch tháng, địa điểm, đếm ngược, lời chúc, xác nhận tham dự, liên hệ, lời kết) và làm đẹp, sống động hơn.

**Thành công khi:**
- Mở link `…/tien-quoc` thấy "Thân gửi Anh Tiến Quốc", mở thiệp có hiệu ứng, nhạc phát.
- Trang chạy mượt trên điện thoại tầm trung (không giật khi cuộn, mở thiệp).
- Trang quản lí: nhập tên → có link trong 1 bước; thấy trạng thái đã mở / sẽ đến.
- Lời chúc và cảm xúc lưu thật trên mạng, mọi khách cùng thấy.

**Thông tin sự kiện:** Thứ Năm 26/11/2026, 10:00 sáng (giờ Việt Nam, UTC+7), kết thúc dự kiến 12:00. Địa điểm, nhạc, ảnh, liên hệ: người dùng điền sau trong `content.js`.

**Ngoài phạm vi:** tự deploy lên Netlify (cần tài khoản người dùng — có hướng dẫn trong README), tiêu đề xem trước link khác nhau cho từng khách, mã QR, xuất CSV, thả tim cho từng lời chúc.

## 2. Trải nghiệm khách

### 2.1 Đường dẫn
| Đường dẫn | Hiển thị |
|---|---|
| `/` | Thiệp chung, "Thân mời bạn" (đăng mạng xã hội) |
| `/<slug>` (vd. `/tien-quoc`) | Thiệp của khách đó. Slug không tồn tại → thiệp chung, không báo lỗi |
| `/<slug>?xem-thu=1` | Như trên nhưng không ghi nhận "đã mở" (dùng khi người gửi xem thử) |
| `/quan-li/` | Trang quản lí |

Slug dành riêng, không cấp cho khách: `quan-li`, `api`, `assets`, `nhac`, `anh`.

### 2.2 Bìa (màn hình đầu, toàn màn hình)
- Nền trời xanh nhạt chuyển sắc, mặt trời phát sáng nhẹ góc trên, 3 lớp mây SVG trôi ngang với tốc độ khác nhau.
- Máy bay giấy bay vào theo đường cong, thả phong bì xanh xuống giữa màn hình (rơi nhẹ, nảy).
- Phong bì: dấu sáp tròn hình mũ tốt nghiệp; dòng chữ "Thư mời tốt nghiệp · Lý Ngọc Thắm"; "Thân gửi" + **[xưng hô] [tên]** (chữ viết tay). Nút **Mở thiệp**.
- Bấm Mở thiệp (hoặc bấm dấu sáp):
  1. Dấu sáp phóng to rồi mờ đi, nắp phong bì lật mở (xoay 3D).
  2. Thiệp trồi lên khỏi phong bì.
  3. Hai dải mây lớn ở tiền cảnh trượt sang hai bên, bìa mờ dần, lộ trang chính.
  4. Mũ tốt nghiệp + giấy màu tung lên (canvas, ~2 giây, tự dừng).
  5. Nhạc nền phát, âm lượng tăng dần 0 → 0.6 trong 2 giây.
- Tổng thời gian mở ≤ 2.5 giây. Trang chính bị khoá cuộn cho tới khi mở thiệp.

### 2.3 Trang chính (thứ tự cuộn)
1. **Hero** — "Lễ tốt nghiệp" nhỏ phía trên, tên **Lý Ngọc Thắm** chữ viết tay lớn, hiện lần lượt từng chữ; dòng phụ ngành/trường (nếu có). Ảnh chân dung trong khung vòm có quầng sáng; chưa có ảnh → hình minh hoạ mây + mũ + chữ lồng "Thắm".
2. **Lời mời** — đoạn mời có chèn tên khách; nếu khách có lời nhắn riêng, hiện thêm tấm thiệp nhỏ kiểu viết tay.
3. **Thời gian** — "Thứ Năm · 26.11.2026 · 10:00 sáng"; lịch tháng 11/2026 (tuần bắt đầu thứ Hai) với ngày 26 đánh dấu; đồng hồ đếm ngược Ngày/Giờ/Phút/Giây, số lật khi đổi; nút **Thêm vào lịch** (Google Calendar, tải file .ics cho iPhone/Outlook). Ghi chú tuỳ chọn (vd. "Đến sớm 15 phút để chụp ảnh nha").
   - Đang diễn ra (10:00–12:00): thay đồng hồ bằng "Lễ tốt nghiệp đang diễn ra 🎓". Sau 12:00: "Cảm ơn mọi người đã đến chung vui".
4. **Địa điểm** — tên nơi tổ chức, địa chỉ, bản đồ Google nhúng (iframe, chỉ gắn khi section cách màn hình ≤ 1 chiều cao), nút **Chỉ đường** mở Google Maps. Chưa điền → "Địa điểm sẽ được cập nhật sớm", không có bản đồ.
5. **Khoảnh khắc** — dải ảnh kiểu polaroid lơ lửng, bấm để xem lớn. Ẩn hẳn khi không có ảnh.
6. **Xác nhận tham dự** — "Bạn sẽ đến chứ?" + hai nút "Mình sẽ đến 🎓" / "Tiếc quá, mình bận". Link chung: hỏi thêm tên. Gửi xong hiện lời cảm ơn + hiệu ứng nhỏ, có thể đổi ý (bấm lại). Link riêng nhớ câu trả lời trước (lấy từ máy chủ); link chung nhớ trong `localStorage` của máy đó.
7. **Sổ lời chúc** — xem 2.4.
8. **Liên hệ** — nút Gọi / Zalo / Messenger, nút nào chưa điền thì ẩn; cả mục ẩn nếu trống.
9. **Lời kết** — đoạn cảm ơn, máy bay giấy bay đi xa, chữ ký "Thắm".

### 2.4 Sổ lời chúc và cảm xúc bay
- Form: tên (điền sẵn tên khách nếu link riêng, sửa được), lời chúc 1–500 ký tự có bộ đếm, nút 💡 chèn ngẫu nhiên một lời chúc gợi ý (lấy từ `content.js`), chọn 1 cảm xúc đi kèm (mặc định 🎓), nút **Gửi lời chúc**. Ô bẫy bot ẩn.
- Gửi thành công: lời chúc mới chen vào đầu danh sách có hiệu ứng, emoji đã chọn tung lên từ nút gửi. Lỗi: thông báo tiếng Việt, giữ nguyên nội dung đã gõ.
- Danh sách: thẻ lời chúc (tên, emoji, thời gian dạng "06-11 15:17", nội dung), mới nhất trên cùng, khung cuộn riêng cao tối đa ~70% màn hình.
- **Thanh cảm xúc** 6 nút: ❤️ `tim`, 🎉 `phao`, 👏 `votay`, 🥹 `xucdong`, 🎓 `mu`, 💐 `hoa`, mỗi nút hiện tổng số. Bấm → emoji bay lên từ nút theo đường lượn ngẫu nhiên, xoay nhẹ, mờ dần (1.6–2.4 giây). Giữ nút → bay liên tục ~8 cái/giây. Số đếm tăng ngay trên máy; gom lại gửi máy chủ sau 1.5 giây không bấm.
- **Cập nhật như live:** mỗi 15 giây (chỉ khi tab đang mở và section lời chúc đã từng hiện) gọi `GET /api/wishes`. Tổng cảm xúc tăng do người khác → cho chừng đó emoji bay (tối đa 12/lần). Lời chúc mới → chen vào đầu danh sách.

### 2.5 Nền trời và chi tiết chung
- 3 lớp nền trời cố định (sáng sớm / giữa trưa / hoàng hôn), chỉ đổi độ trong suốt theo % cuộn trang.
- Nút nhạc tròn cố định góc dưới trái: hình đĩa than quay khi phát, có vạch sóng nhạc; bấm để bật/tắt. File nhạc lỗi hoặc không có → nút tự ẩn.
- Các khối hiện dần khi cuộn tới (trượt lên 24px + hiện rõ, con lần lượt).
- Thẻ meta: `noindex`; Open Graph tiêu đề "Thư mời tốt nghiệp · Lý Ngọc Thắm", mô tả ngày giờ, ảnh `og.png` 1200×630.

## 3. Trang quản lí `/quan-li/`
- **Đăng nhập:** ô mật khẩu → lưu vào `sessionStorage`, gửi kèm mọi yêu cầu quản lí. Sai mật khẩu → báo lỗi, xoá mật khẩu đã lưu. Nút đăng xuất.
- **Thống kê:** tổng khách · đã mở · sẽ đến · không đến · số lời chúc.
- **Thêm khách:** tên (bắt buộc, 1–60 ký tự), xưng hô (gợi ý: Anh, Chị, Em, Bạn, Cô, Chú, Thầy, Gia đình; gõ tự do được; có thể để trống), lời nhắn riêng (≤ 300 ký tự). Tạo xong hiện link cùng 3 nút: **Copy link**, **Copy kèm lời mời** (mẫu trong `content.js`, thay `{ten}`, `{link}`), **Chia sẻ** (Web Share API; máy không hỗ trợ thì ẩn).
- **Thêm hàng loạt:** ô dán nhiều dòng, mỗi dòng một khách; cho phép dạng `Anh | Tiến Quốc` để kèm xưng hô. Kết quả liệt kê link từng người.
- **Danh sách khách:** ô tìm (không phân biệt dấu); mỗi khách: xưng hô + tên, link, nhãn trạng thái (Chưa mở / Đã mở N lần · lần đầu lúc …), nhãn tham dự (Sẽ đến / Không đến / Chưa trả lời); nút Copy link, Copy kèm lời mời, Xem thử (mở `?xem-thu=1` tab mới), Sửa, Xoá (hỏi xác nhận).
- **Xác nhận từ link chung:** danh sách tên + câu trả lời.
- **Lời chúc:** danh sách đầy đủ, nút Xoá từng lời chúc (hỏi xác nhận).
- Giao diện cùng bảng màu, ưu tiên rõ ràng, dùng tốt trên điện thoại.

## 4. Kiến trúc

### 4.1 Công nghệ
Vite 8 (2 trang: `index.html`, `quan-li/index.html`) · JavaScript thuần (ES modules) · GSAP 3 (chuỗi mở thiệp, máy bay giấy) · CSS thuần với biến màu · Font đóng gói qua @fontsource: **Great Vibes** (tên, chữ viết tay), **Playfair Display** (tiêu đề), **Quicksand** (chữ thường) — cả ba có tiếng Việt · Netlify Functions (v2) + **@netlify/blobs** · Vitest.

### 4.2 Cấu trúc thư mục
```
ThiepTotNghiep/
├── index.html                 thiệp
├── quan-li/index.html         trang quản lí
├── content.js                 toàn bộ nội dung, chú thích tiếng Việt
├── public/                    og.png, favicon.svg, nhac/, anh/
├── src/
│   ├── main.js                khởi động thiệp
│   ├── lib/                   slug, thời gian & lịch & .ics, gọi API, tiện ích DOM
│   ├── fx/                    nền trời, mây, pháo giấy (canvas), emoji bay, hiện dần
│   ├── sections/              cover, hero, invite, schedule, venue, gallery, rsvp, wishes, contact, closing, music
│   ├── admin/                 main.js + các phần của trang quản lí
│   └── styles/                tokens.css, base.css, mỗi section một file
├── server/
│   ├── router.js              nhận Request → trả Response, không phụ thuộc Netlify
│   ├── handlers/              guests, wishes, reactions, rsvp
│   ├── store/                 blobs.js (Netlify), file.js (chạy trên máy), memory.js (test)
│   └── validate.js
├── netlify/functions/api.mjs  bọc router + store Netlify Blobs
├── vite-plugin-api.js         khi chạy dev: gắn router vào Vite, lưu file .data/
├── netlify.toml
└── tests/
```
Mỗi section là một module `render(root, ctx)` độc lập; lỗi trong một section được bắt và chỉ ẩn section đó (giống trang kỷ niệm).

### 4.3 Lưu trữ
Kho Blobs tên `thiep`, chế độ đọc **strong consistency**. Mỗi tập dữ liệu là một tài liệu JSON:

| Khoá | Nội dung |
|---|---|
| `guests` | `{ guests: [{ slug, name, title, note, createdAt, openCount, firstOpenedAt, lastOpenedAt, rsvp: { attending, at } \| null }] }` |
| `rsvps` | `{ rsvps: [{ id, name, attending, at }] }` — trả lời từ link chung |
| `wishes` | `{ wishes: [{ id, name, message, emoji, slug, at }] }` — mới nhất đầu, tối đa 1000 |
| `reactions` | `{ counts: { tim, phao, votay, xucdong, mu, hoa } }` |

Thời gian lưu dạng ISO 8601 UTC. `id` = chuỗi ngẫu nhiên 10 ký tự.

Giao diện store chung (cả 3 bản cài đặt):
- `get(key) → { data, etag } | null`
- `set(key, data, { etag }) → boolean` — `etag` null nghĩa là chỉ ghi khi chưa tồn tại; trả `false` khi bị người khác ghi trước.
- Hàm `update(store, key, fn, fallback)` đọc → `fn(data)` → ghi có điều kiện, thử lại tối đa 6 lần (chờ ngẫu nhiên 20–120 ms) rồi báo lỗi 503.

Netlify: `getWithMetadata(key, { type: 'json' })` lấy etag; `setJSON(key, data, { onlyIfMatch | onlyIfNew })`. Chạy máy: file `.data/<key>.json`, etag = số phiên bản, khoá trong tiến trình.

### 4.4 API (`/api/*`, JSON)
Công khai:
| Phương thức | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/guests/:slug` | `{ name, title, note, rsvp }` hoặc 404 |
| POST | `/api/guests/:slug/opened` | tăng `openCount`, đặt `firstOpenedAt` (lần đầu), `lastOpenedAt` → 204 |
| POST | `/api/rsvp` | `{ slug?, name?, attending }` → ghi vào khách (có slug) hoặc `rsvps` (cần name) → 200 |
| GET | `/api/wishes` | `{ wishes, reactions }` — lời chúc trả về không kèm `slug` |
| POST | `/api/wishes` | `{ name, message, emoji, slug?, website }` → 201 + lời chúc vừa tạo |
| POST | `/api/reactions` | `{ counts: { tim: 3, … } }` (mỗi loại 0–60) → `{ counts }` tổng mới |

Quản lí (header `Authorization: Bearer <mật khẩu>`; so sánh an toàn thời gian; thiếu/sai → 401; máy chủ chưa đặt `ADMIN_PASSWORD` → 503 "Chưa đặt mật khẩu quản lí"):
| Phương thức | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/admin/overview` | `{ guests, rsvps, wishes, reactions }` |
| POST | `/api/admin/guests` | `{ guests: [{ name, title?, note? }] }` (1–200) → `{ created: [...] }` |
| PATCH | `/api/admin/guests/:slug` | sửa `name`, `title`, `note` (slug giữ nguyên) |
| DELETE | `/api/admin/guests/:slug` | xoá khách |
| DELETE | `/api/admin/wishes/:id` | xoá lời chúc |

**Kiểm tra dữ liệu:** cắt khoảng trắng, bỏ ký tự điều khiển; tên khách 1–60, xưng hô ≤ 20, lời nhắn ≤ 300, tên người chúc 1–40, lời chúc 1–500, emoji thuộc danh sách cho phép. Ô bẫy `website` có nội dung → trả 201 giả, không lưu. Body > 20 KB → 413. Lỗi trả `{ error: "<thông báo tiếng Việt>" }`.

**Tạo slug:** bỏ dấu tiếng Việt (`đ` → `d`), chữ thường, ký tự khác chữ/số thành `-`, gộp `-`, tối đa 40 ký tự. Trùng hoặc thuộc danh sách dành riêng → thêm `-2`, `-3`…; tên không ra slug nào (vd. toàn emoji) → `khach-<4 ký tự ngẫu nhiên>`.

### 4.5 Định tuyến Netlify (`netlify.toml`)
- Build: `npm run build`, publish `dist`, functions `netlify/functions`.
- `/api/*` → `/.netlify/functions/api/:splat` (200). Router chấp nhận cả tiền tố `/api` và `/.netlify/functions/api`.
- `/*` → `/index.html` (200, không ép — file tĩnh có thật như `/quan-li/` vẫn được phục vụ).
- Dev: `vite-plugin-api.js` gắn router vào `/api`, chuyển `/quan-li` → `/quan-li/`. Mật khẩu dev đọc từ `.env.local` (`ADMIN_PASSWORD`), không có thì dùng `thiep-dev` và in ra terminal.

## 5. Hiệu năng
- Chỉ animate `transform` và `opacity`; `will-change` chỉ gắn khi đang chạy.
- Mây: SVG inline, mỗi lớp lặp bằng CSS keyframes; tạm dừng (`animation-play-state`) khi tab ẩn.
- Pháo giấy: 1 canvas, tối đa ~140 hạt, `requestAnimationFrame` dừng hẳn khi hết hạt; giới hạn tỉ lệ điểm ảnh ở 2.
- Emoji bay: phần tử DOM với CSS animation, tối đa 40 cùng lúc, xoá khi `animationend`.
- Nền trời đổi theo cuộn: 1 listener `scroll` passive + `requestAnimationFrame`, chỉ đổi opacity 2 lớp.
- Bản đồ, ảnh album: tải lười. Font: chỉ các độ đậm dùng tới.
- `prefers-reduced-motion: reduce`: không mây trôi, không máy bay, mở thiệp bằng hiệu ứng mờ đơn giản, emoji bay ít và ngắn.
- Mục tiêu: JS thiệp (đã nén gzip) ≤ 90 KB không tính font.

## 6. Xử lý lỗi
- API khách lỗi/không mạng → vẫn hiện thiệp chung "Thân mời bạn".
- Gửi lời chúc / xác nhận / cảm xúc lỗi → thông báo nhỏ (toast) tiếng Việt, giữ dữ liệu đã nhập; cảm xúc gửi lỗi thì cộng dồn gửi lại lần sau.
- Tải lời chúc lỗi → "Chưa tải được lời chúc, thử lại sau" + nút thử lại; vòng cập nhật 15 giây tiếp tục thử.
- Một section ném lỗi khi dựng → ẩn section đó, ghi `console.error`, các phần khác vẫn chạy.

## 7. Kiểm thử
- **Vitest (tự động):** tạo slug (dấu, `đ`, trùng, dành riêng, rỗng); ngày giờ (đếm ngược, trạng thái trước/đang/sau lễ, lưới lịch tháng 11/2026 bắt đầu thứ Hai, ngày 26 là thứ Năm); link Google Calendar và nội dung .ics (10:00 +07 = 03:00Z); router + memory store (thêm khách, slug trùng, cần mật khẩu, ghi nhận mở, rsvp có/không slug, kiểm tra lời chúc, ô bẫy, giới hạn cảm xúc, xoá); `update` thử lại khi etag xung đột; điền mẫu lời mời `{ten}`, `{link}`.
- **Trình duyệt (thủ công qua preview):** khổ điện thoại 375×812 và máy tính; mở thiệp, nhạc (khi có file), cuộn hết trang, gửi lời chúc, thả cảm xúc, xác nhận tham dự; trang quản lí: đăng nhập, thêm 1 khách, thêm hàng loạt, mở link khách thấy đúng tên, trạng thái "đã mở" cập nhật, xem thử không tính; không lỗi console.
- **Build:** `npm run build` thành công, kiểm tra kích thước JS.

## 8. Nội dung `content.js`
Gồm: `graduate` (họ tên, tên gọi, ngành, trường), `event` (ngày, giờ bắt đầu/kết thúc, ghi chú), `venue` (tên, địa chỉ, truy vấn bản đồ, link chỉ đường), `music` (đường dẫn file, tên bài), `photos` (ảnh chân dung, danh sách ảnh album), `contact` (điện thoại, Zalo, Messenger), `texts` (lời mời, lời kết, mẫu tin nhắn mời), `wishSuggestions` (≥ 10 lời chúc gợi ý). Trường rỗng → phần tương ứng ẩn hoặc hiện thông báo thay thế như mô tả ở mục 2.
