// ─────────────────────────────────────────────────────────────
//  NỘI DUNG THIỆP — sửa chữ, ngày giờ, địa điểm, nhạc, ảnh ở đây.
//  Ô nào để trống ('' hoặc []) thì phần tương ứng tự ẩn hoặc hiện
//  thông báo thay thế, không làm hỏng trang.
// ─────────────────────────────────────────────────────────────

export default {
  // Người tốt nghiệp
  graduate: {
    fullName: 'Lý Ngọc Thắm',
    shortName: 'Thắm', // dùng trong lời mời, chữ ký
    degree: '', // vd. 'Cử nhân'
    major: '', // vd. 'Quản trị Kinh doanh'
    school: '', // vd. 'Trường Đại học Kinh tế TP.HCM'
  },

  // Thời gian — ngày dạng 'YYYY-MM-DD', giờ dạng 'HH:mm' (giờ Việt Nam)
  event: {
    date: '2026-11-26',
    start: '10:00',
    end: '12:00',
    note: '', // vd. 'Mọi người đến sớm 15 phút để chụp ảnh cùng Thắm nha 📸'
  },

  // Địa điểm
  venue: {
    name: '', // vd. 'Hội trường A — Trường Đại học ...'
    address: '', // vd. '59C Nguyễn Đình Chiểu, Quận 3, TP.HCM'
    // Chữ để tìm trên Google Maps (tên trường + địa chỉ là chắc nhất).
    // Có giá trị thì trang hiện bản đồ nhúng.
    mapQuery: '',
    // Link chỉ đường (tuỳ chọn). Để trống thì tự tạo từ mapQuery.
    // Lấy link: mở Google Maps → tìm trường → Chia sẻ → Sao chép đường liên kết.
    directionsUrl: '',
  },

  // Nhạc nền: chép file .mp3 vào public/nhac/ rồi ghi đường dẫn, vd. '/nhac/nhac-nen.mp3'
  music: {
    src: '',
    title: '',
  },

  // Ảnh: chép vào public/anh/ rồi ghi đường dẫn, vd. '/anh/chan-dung.jpg'
  // Nên dùng ảnh JPG/WebP chiều dài ~1600px để tải nhanh.
  photos: {
    hero: '/anh/tham-chibi.svg', // ảnh chân dung (dọc) — đang là tranh chibi, thay bằng ảnh khác tuỳ ý
    gallery: [], // vd. ['/anh/1.jpg', '/anh/2.jpg']
  },

  // Liên hệ — ô nào trống thì nút đó ẩn
  contact: {
    phone: '', // vd. '0901234567'
    zalo: '', // số điện thoại Zalo, vd. '0901234567'
    messenger: '', // tên người dùng Facebook, vd. 'ngoctham.ly'
  },

  texts: {
    heroQuote: 'Mỗi giấc mơ đều bắt đầu từ một bầu trời rộng mở ☁️',
    inviteLead: 'Thân mời',
    inviteBody:
      'đến chung vui cùng Thắm trong ngày lễ tốt nghiệp — khoảnh khắc khép lại những năm tháng giảng đường và mở ra một chặng đường mới. Có mặt của mọi người sẽ là món quà ý nghĩa nhất với Thắm 💙',
    closing:
      'Một hành trình khép lại, một chặng đường mới mở ra.\nCảm ơn gia đình, thầy cô và bạn bè đã luôn đồng hành cùng Thắm suốt những năm đại học. Rất mong được gặp mọi người trong ngày đặc biệt này 🎓',
    // Mẫu tin nhắn khi bấm "Copy kèm lời mời" ở trang quản lí.
    // {ten} = xưng hô + tên khách, {link} = link thiệp của khách đó.
    shareTemplate:
      'Thắm trân trọng mời {ten} đến dự lễ tốt nghiệp của Thắm lúc 10:00 sáng Thứ Năm, 26/11/2026 🎓\nThiệp mời: {link}',
  },

  // Lời chúc gợi ý khi khách bấm nút 💡
  wishSuggestions: [
    'Chúc mừng Thắm đã chính thức tốt nghiệp! 🎓 Chúc Thắm luôn vững vàng và rực rỡ trên chặng đường mới.',
    'Tự hào về Thắm quá! Chúc bạn sớm tìm được công việc như ý và luôn giữ nụ cười thật tươi nha 💙',
    'Happy Graduation! Chúc Thắm bay thật cao, thật xa như bầu trời xanh mà bạn yêu ☁️',
    'Bao nhiêu năm cố gắng cuối cùng cũng hái quả ngọt rồi. Chúc mừng Thắm nhé, tương lai rộng mở đang chờ phía trước! ✨',
    'Chúc tân cử nhân luôn mạnh khoẻ, hạnh phúc, công danh thăng tiến và gặp thật nhiều may mắn 🍀',
    'Một chương mới bắt đầu rồi! Chúc Thắm luôn tự tin, dũng cảm theo đuổi ước mơ của mình 🌤️',
    'Chúc mừng Thắm tốt nghiệp! Mong mọi điều tốt đẹp nhất sẽ luôn đến với bạn 💐',
    'Cảm ơn Thắm vì những năm tháng thanh xuân thật đẹp. Chúc bạn tốt nghiệp vui vẻ và thành công rực rỡ 🎉',
    'Chúc Thắm ra trường lương cao, việc nhẹ, sếp thương, đồng nghiệp quý và đi đâu cũng gặp người tốt 😆',
    'Chúc mừng ngày tốt nghiệp! Chúc Thắm mãi giữ được nhiệt huyết và sự tử tế như bây giờ 🫶',
    'Hành trình đại học khép lại thật đẹp. Chúc Thắm vững bước trên con đường phía trước, luôn bình an và hạnh phúc 🌈',
  ],
}
