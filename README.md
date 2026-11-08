# 🎓 Thiệp mời tốt nghiệp · Ngọc Thắm

Thiệp mời online phong cách **"Bầu trời mây"** tông xanh da trời:

- **Bìa phong bì:** máy bay giấy thả phong bì "Thân gửi [tên khách]". Bấm *Mở thiệp* thì mây tách ra, mũ tốt nghiệp và giấy màu tung lên, nhạc nền phát.
- **Các phần của thiệp:** lời mời có tên từng người, ngày giờ kèm lịch tháng và đếm ngược, nút thêm vào lịch, bản đồ trường, album ảnh, xác nhận tham dự, sổ lời chúc, liên hệ.
- **Cảm xúc bay:** bấm ❤️ 🎉 👏 🥹 🎓 💐 là emoji bay lên. Người khác thả cảm xúc hay gửi lời chúc thì máy bạn cũng thấy, như đang xem live.
- **Trang quản lí `/quan-li`:** nhập tên là ra link mời riêng, copy kèm lời mời soạn sẵn, xem ai đã mở thiệp, ai sẽ đến, xoá lời chúc không phù hợp.

---

## Chạy trên máy

Cần [Node.js](https://nodejs.org) bản 20 trở lên. Mở terminal trong thư mục này:

```bash
npm install
```

```bash
npm run dev
```

- Thiệp: `http://localhost:5173`
- Trang quản lí: `http://localhost:5173/quan-li`. Mật khẩu mặc định khi chạy trên máy là **`thiep-dev`**.

Muốn đổi mật khẩu khi chạy trên máy: chép `.env.example` thành `.env.local` rồi điền `ADMIN_PASSWORD=...`.

Dữ liệu thử (khách, lời chúc) khi chạy trên máy được lưu trong thư mục `.data/`. Xoá thư mục này là sạch dữ liệu. Thư mục này không được đưa lên mạng.

---

## Điền nội dung

### Cách nhanh: tab Cài đặt trong trang quản lí

Vào `…/quan-li` → tab **Cài đặt**. Sửa xong bấm **Lưu** là khách mở thiệp thấy ngay, không cần deploy lại. Sửa được:

- **Thời gian:** ngày, giờ bắt đầu, giờ kết thúc, ghi chú.
- **Địa điểm:** tên nơi tổ chức, địa chỉ, chữ tìm trên bản đồ, link chỉ đường.
- **Tên & lời văn:** tên hiển thị, tên gọi ngắn, câu dưới tên, lời mời, lời kết, mẫu tin nhắn gửi khách.
- **Nhạc & liên hệ:** link YouTube, link Spotify, tên bài hát, điện thoại, Zalo, Facebook (dán link trang cá nhân).

Ô để trống thì phần đó trên thiệp tự ẩn. Nút **Khôi phục mặc định** đưa mọi thứ về như trong `content.js`. Ảnh xem trước khi gửi link (Zalo, Messenger) là ảnh cố định, không ghi ngày giờ nên không bao giờ hiện giờ cũ.

### Sửa trong code: `content.js`

Mọi chữ trên thiệp có giá trị mặc định trong **`content.js`**, mỗi dòng đều có chú thích. Ô nào để trống thì phần đó tự ẩn. Ảnh, album, ngành/trường, file nhạc `.mp3` và lời chúc gợi ý chỉ sửa được ở đây (sửa xong phải deploy lại). Những ô đã lưu trong tab Cài đặt được ưu tiên hơn `content.js`.

| Muốn thêm | Làm thế này |
|---|---|
| **Trường / địa điểm** | Điền `venue.name`, `venue.address`, `venue.mapQuery`. `mapQuery` là chữ để tìm trên Google Maps, ví dụ `'Trường Đại học Kinh tế TP.HCM, 59C Nguyễn Đình Chiểu'`. Có `mapQuery` thì thiệp hiện bản đồ. |
| **Nhạc nền** | Khách bật/tắt nhạc bằng nút đĩa nhạc ở góc dưới. **Cách 1 (đang dùng):** chép file `.mp3` vào `public/nhac/`, rồi ghi `music.src: '/nhac/ten-file.mp3'`. Nên dùng file nhỏ hơn 5 MB; nhạc phát trọn bài khi khách bấm *Mở thiệp*, kể cả trên iPhone. **Cách 2:** dán link YouTube vào `music.youtube`. Nhạc phát trọn bài từ đầu (muốn bắt đầu ở giây khác thì thêm `&t=30` vào link), trình phát được giấu đi và nhạc tự bật khi bấm *Mở thiệp*. Trên iPhone, YouTube không cho tự bật tiếng, nên một trình phát nhỏ hiện ở góc để khách bấm ▶, nhạc chạy rồi thì tự ẩn. **Cách 3:** dán link Spotify vào `music.spotify`. Trình phát hiện ở phần đầu thiệp, nhưng khách chưa đăng nhập Spotify chỉ nghe được 30 giây do Spotify tự chọn đoạn. Có nhiều cách cùng lúc thì ưu tiên: `.mp3` → YouTube → Spotify. |
| **Ảnh chân dung** | Chép ảnh vào `public/anh/`, ghi `photos.hero: '/anh/chan-dung.jpg'`. Nên dùng ảnh dọc, dài khoảng 1600px. |
| **Album ảnh** | `photos.gallery: ['/anh/1.jpg', '/anh/2.jpg']`. |
| **Ngành, trường** | `graduate.degree`, `graduate.major`, `graduate.school`. |
| **Liên hệ** | `contact.phone`, `contact.zalo` (số điện thoại), `contact.messenger` (Facebook: link trang cá nhân hoặc tên người dùng). |
| **Ghi chú giờ giấc** | `event.note`, ví dụ "Đến sớm 15 phút để chụp ảnh nha 📸". |
| **Mẫu tin nhắn mời** | `texts.shareTemplate`. Trong đó `{ten}` là tên khách, `{link}` là link riêng của người đó, `{gio}` là giờ bắt đầu (vd. "10:00 sáng"), `{ngay}` là ngày (vd. "Thứ Năm, 26/11/2026"). |

> Trình duyệt không cho tự phát nhạc khi chưa bấm gì, nên nhạc bắt đầu khi khách bấm **Mở thiệp**. Trên iPhone, âm lượng theo nút âm lượng của máy.

---

## Đưa lên mạng (Netlify, miễn phí)

Dùng luôn tài khoản Netlify bạn đã có cho trang kỷ niệm.

**Lần đầu:**

1. Đăng nhập (trình duyệt sẽ mở để bạn xác nhận):
   ```bash
   npx netlify login
   ```
2. Deploy lần đầu. Khi được hỏi, chọn **Create & configure a new project** và đặt tên, ví dụ `ngoctham-totnghiep`:
   ```bash
   npm run deploy
   ```
3. Đặt mật khẩu cho trang quản lí. Thay `mat-khau-cua-ban` bằng mật khẩu khó đoán:
   ```bash
   npx netlify env:set ADMIN_PASSWORD "mat-khau-cua-ban"
   ```
4. Deploy lại để mật khẩu có hiệu lực:
   ```bash
   npm run deploy
   ```
5. Netlify in ra link dạng `https://ngoctham-totnghiep.netlify.app`. Vào `…/quan-li`, đăng nhập rồi thêm khách.
6. Kiểm tra nhanh phần lưu dữ liệu. Thay bằng link của bạn; kết quả phải là chữ dạng `{"wishes":[...]}`, không phải trang HTML:
   ```bash
   curl https://ngoctham-totnghiep.netlify.app/api/wishes
   ```
7. Mở thử thiệp trên **iPhone** (Safari và trong Zalo) để chắc nhạc phát khi bấm *Mở thiệp*.

**Những lần sau** (sửa `content.js`, thêm ảnh, đổi nhạc):

```bash
npm run deploy
```

Khách mời, lời chúc và xác nhận được lưu trên Netlify (Netlify Blobs), nên deploy lại **không làm mất dữ liệu**.

---

## Gửi thiệp

1. Vào trang quản lí và nhập tên khách. Tên ghi thế nào thì thiệp hiện đúng như vậy; lời nhắn riêng có thể bỏ trống.
2. Bấm **Copy kèm lời mời** rồi dán vào Zalo/Messenger. Trên điện thoại có thể bấm **Chia sẻ**.
3. Có nhiều người thì bấm **Thêm nhiều người cùng lúc**, dán danh sách mỗi dòng một tên.
4. Muốn xem trước thiệp của ai thì bấm biểu tượng 👁. Mở bằng nút này **không** bị tính là khách đã mở.
5. Bấm **Ảnh QR** để có thiệp QR mang tên khách: nền trời xanh, "Thân mời [tên]", mã QR mở đúng link của người đó, kèm tên lễ và ngày giờ theo tab Cài đặt. Bấm **Tải ảnh** để lưu, hoặc **Chia sẻ** (trên điện thoại) để gửi thẳng qua Zalo.

Link không có tên (`https://ten-trang.netlify.app`) vẫn mở được, thiệp ghi "Thân mời bạn". Dùng link này khi đăng lên mạng xã hội. Dòng **Link chung** trong tab Khách mời có nút copy và **Ảnh QR** để in hoặc đăng lên mạng.

---

## Lưu ý

- Trang có gắn thẻ để Google **không** đưa vào kết quả tìm kiếm.
- Link khách dạng `/tien-quoc` dễ đoán. Người đoán trúng chỉ thấy tên và lời nhắn trên thiệp, không xem được gì khác.
- Mật khẩu quản lí chỉ nằm trong cài đặt Netlify, không có trong code.
- Ai cũng gửi được lời chúc, nên thỉnh thoảng bạn vào tab **Lời chúc** của trang quản lí để xoá tin không phù hợp.
- Nếu `/api` báo lỗi sau khi deploy, kiểm tra mục *Functions* trong trang Netlify của dự án xem có hàm `api` chưa.

## Lệnh hữu ích

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy trên máy để xem và sửa |
| `npm test` | Chạy test tự động |
| `npm run build` | Build ra thư mục `dist/` |
| `npm run deploy` | Build và đưa lên Netlify |
