# Tab Cài đặt trong trang quản lí — Thiết kế

## Mục tiêu

Người gửi thiệp tự đổi thông tin thiệp (giờ, địa điểm, tên, lời văn, nhạc, liên hệ) ngay trong trang quản lí, không sửa code, không deploy lại. Bấm **Lưu** là khách mở thiệp thấy thông tin mới. Khách mời, xác nhận và lời chúc giữ nguyên.

Không làm: tải ảnh lên, sửa lời chúc gợi ý, đổi ảnh/mô tả xem trước khi gửi link theo cài đặt.

## Các mục sửa được

| Nhóm | Ô | Khoá trong `content.js` | Quy tắc |
|---|---|---|---|
| Thời gian | Ngày | `event.date` | bắt buộc, `YYYY-MM-DD`, ngày có thật |
| | Giờ bắt đầu / kết thúc | `event.start`, `event.end` | bắt buộc, `HH:mm`; kết thúc sau bắt đầu |
| | Ghi chú | `event.note` | ≤ 300 ký tự, được để trống |
| Địa điểm | Tên nơi tổ chức | `venue.name` | ≤ 150 |
| | Địa chỉ | `venue.address` | ≤ 200 |
| | Chữ tìm trên bản đồ | `venue.mapQuery` | ≤ 300; trống thì ẩn bản đồ |
| | Link chỉ đường | `venue.directionsUrl` | trống hoặc link `http(s)://`, ≤ 500 |
| Tên & lời văn | Tên hiển thị | `graduate.fullName` | bắt buộc, ≤ 60 |
| | Tên gọi ngắn | `graduate.shortName` | bắt buộc, ≤ 30 |
| | Câu dưới tên | `texts.heroQuote` | ≤ 200 |
| | Lời mời (mở đầu / nội dung) | `texts.inviteLead`, `texts.inviteBody` | ≤ 40 / ≤ 1000 |
| | Lời kết | `texts.closing` | ≤ 1000, nhiều dòng |
| | Mẫu tin nhắn gửi khách | `texts.shareTemplate` | bắt buộc, ≤ 600, phải có `{link}` |
| Nhạc & liên hệ | Link YouTube | `music.youtube` | trống hoặc link YouTube đọc được |
| | Link Spotify | `music.spotify` | trống hoặc link Spotify đọc được |
| | Tên bài hát | `music.title` | ≤ 100 |
| | Điện thoại / Zalo | `contact.phone`, `contact.zalo` | trống hoặc 8–15 chữ số (cho phép `+`, dấu cách, `.`) |
| | Messenger | `contact.messenger` | ≤ 100 |

Ô "được để trống" mà trống thì phần tương ứng tự ẩn, như hiện nay. File `music.src` (mp3) vẫn chỉ đặt trong `content.js` và luôn được ưu tiên hơn link.

## Lưu trữ và API

- Lưu trong Netlify Blobs, khoá `config`: `{ settings, updatedAt }`. `settings` có đúng các khoá ở bảng trên, chia theo nhóm như `content.js` (`event`, `venue`, `graduate`, `texts`, `music`, `contact`).
- `GET /api/config` (công khai) → `{ settings }`; chưa lưu lần nào thì `{ settings: {} }`.
- `PUT /api/admin/config` (cần mật khẩu) nhận `{ settings }` đầy đủ, kiểm tra theo bảng trên, lưu, trả `{ settings }`. Sai thì 400 kèm câu báo lỗi tiếng Việt chỉ rõ ô nào (vd. "Giờ kết thúc phải sau giờ bắt đầu").
- `DELETE /api/admin/config` (cần mật khẩu) xoá cài đặt đã lưu → thiệp quay về nội dung trong `content.js`.
- Khoá lạ trong `settings` bị bỏ qua, không lưu.

## Ghép nội dung

Một hàm dùng chung ghép `content.js` với `settings`: ô nào có trong `settings` (kể cả chuỗi rỗng) thì dùng giá trị đó; ô nào không có thì giữ mặc định trong `content.js`. Thiệp và trang quản lí dùng cùng hàm này.

## Thiệp (phía khách)

- Lúc mở trang, tải cài đặt song song với tên khách. Bìa và nhạc chờ cài đặt tối đa 2,5 giây (trời và mây vẫn hiện trong lúc chờ); quá hạn hoặc lỗi thì dùng `content.js`.
- Mọi phần đọc nội dung đã ghép: bìa, phần đầu, lời mời, thời gian, lịch, đếm ngược, địa điểm, bản đồ, liên hệ, lời kết, nhạc.
- Dòng "Thiệp có nhạc nền" trên bìa hiện khi có mp3, YouTube hoặc Spotify.

## Trang quản lí

- Thêm tab **Cài đặt** sau tab Lời chúc. Form chia 4 nhóm như bảng, điền sẵn nội dung hiện tại (đã ghép). Ngày dùng ô chọn ngày, giờ dùng ô chọn giờ.
- Nút **Lưu**: gửi toàn bộ form; thành công thì báo "Đã lưu, khách mở thiệp sẽ thấy ngay"; lỗi thì báo đúng câu từ máy chủ.
- Nút **Khôi phục mặc định**: hỏi xác nhận, xoá cài đặt đã lưu, điền lại form từ `content.js`.
- Đang sửa dở thì việc tự làm mới khi quay lại tab không xoá form.
- Dòng tiêu đề trang quản lí (tên · ngày) dùng nội dung đã ghép.

## Mẫu tin nhắn gửi khách

Ngoài `{ten}` và `{link}`, mẫu nhận thêm `{ngay}` (vd. "Thứ Năm, 26/11/2026") và `{gio}` (vd. "10:00 sáng"), tự điền theo cài đặt. Mẫu mặc định đổi thành:
`Thắm trân trọng mời {ten} đến dự lễ tốt nghiệp của Thắm lúc {gio} {ngay} 🎓\nThiệp mời: {link}`

## Xem trước khi gửi link

Ảnh và mô tả xem trước là file cố định lúc build, không đổi theo cài đặt. Bỏ ngày giờ khỏi cả hai để không bao giờ hiện giờ cũ: mô tả còn "Trân trọng mời bạn đến dự lễ tốt nghiệp của Ngọc Thắm.", ảnh còn "Thư mời tốt nghiệp · NGỌC THẮM".

## Kiểm thử

- Kiểm tra từng quy tắc ở bảng (đúng và sai), ghép nội dung (có/không có/chuỗi rỗng), điền `{ngay}` `{gio}`.
- API: đọc khi chưa có, lưu đúng rồi đọc lại, lưu sai → 400, thiếu/sai mật khẩu → 401, khôi phục mặc định.
- Trình duyệt: đổi giờ và địa điểm trong tab Cài đặt → mở thiệp thấy giờ, lịch, đếm ngược, địa điểm, bản đồ mới; khôi phục mặc định → về như cũ.
