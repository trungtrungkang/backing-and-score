# 🎨 Lotusa V2 Complete UI/UX Flow Design

Dưới đây là bản thiết kế tổng thể cho toàn bộ 4 màn hình chính của ứng dụng. Mục tiêu của thiết kế này là mang lại cảm giác của một sản phẩm SaaS (Software as a Service) chuyên nghiệp, cao cấp và đáp ứng đúng nhu cầu của từng nhóm đối tượng (Creator vs. Player).

---

## 1. Màn Hình: Discover / Home Page (`/` hoặc `/discover`)
**Mục đích:** Nơi người dùng mới (Guest/Learner) khám phá kho tàng Sheet nhạc và Backing Track của cộng đồng.

**Thay đổi UX:** Thay vì hiển thị danh sách dạng bảng nhàm chán như hiện tại, trang này sẽ được thiết kế giống Apple Music hoặc Spotify.
- **Hero Section:** Thanh tìm kiếm lớn (Search theo tên bài, nhạc sĩ) kết hợp với các nút lọc nhanh (Pills) theo Nhạc cụ (Piano, Violin...).
- **Music Cards:** Hiển thị dưới dạng thẻ lớn, có Ảnh bìa (Cover art), Tên bài hát, Tác giả, và quan trọng nhất là Label (Nhãn) báo hiệu độ khó (Easy, Intermediate...).
- **Flow:** Khi click vào thẻ bài hát, hệ thống sẽ **chuyển thẳng người dùng tới màn hình Practice Player** chứ KHÔNG vào màn hình Editor.

![Discover Page UI Vision](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/ui_discover_page_1773772782191.png)

---

## 2. Màn Hình: Dashboard / My Projects (`/dashboard`)
**Mục đích:** Bảng điều khiển cá nhân (Workspace) dành cho người học hoặc người soạn nhạc (Creator) quản lý dữ liệu của chính họ.

**Thay đổi UX:**
- **Sidebar Trái:** Thanh menu rành mạch với các hệ thống tổ chức file: *Recent (Gần đây), My Uploads (Đã tải lên), Favorites (Yêu thích), Setlists (Danh sách biểu diễn).*
- **Main Area:** Hiển thị các project của user.
- **Action Buttons:** Mỗi project sẽ có nút **[Play]** (Dành để tập/biểu diễn) và nút **[Edit]** màu xám (Dành để vào mode Arranger tinh chỉnh timemap/stems). Quả tạ nặng nề của việc Syncing sẽ được giấu kín sau nút Edit. Nút `Create New Project` nổi bật ở góc trên.

![Dashboard Page UI Vision](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/ui_dashboard_page_1773772797517.png)

---

## 3. Màn Hình: The Arranger / Editor (`/p/[projectId]`)
**Mục đích:** Dành cho Creator (Nhà sản xuất, Giáo viên) làm nhiệm vụ "kỹ thuật": Căn chỉnh thời gian (Timemap), Nudge audio, Thêm/xoá track, và xử lý Mix âm thanh.

**Thay đổi UX:** (Đây chính là màn hình hiện tại chúng ta đang xây dựng)
- **Top:** Hiện thị Sheet nhạc nguyên bản.
- **Bottom:** Khu vực kỹ thuật TrackList phức tạp với giao diện của một phần mềm thu âm (DAW). Bao gồm: Sóng âm (Waveform) đa kênh, thước kẻ dòng thời gian chính xác (Timeline Ruler), và các tính năng Mixer (Volume, Pan, Mute, Solo) cho Audio Stems.
- **Dành riêng:** Màn hình này sẽ giấu đi hết sức có thể với user bình thường, chỉ những người có quyền "Owner" (Người tải lên) mới có nhu cầu dùng các công cụ tinh chỉnh Timemap phức tạp ở đây.

![Editor Page UI Vision](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/ui_editor_page_1773772814138.png)

---

## 4. Màn Hình: Practice Player (`/play/[projectId]`)
**Mục đích:** Tomplay-style. Dành 100% không gian cho nhạc công đọc sheet nhạc và luyện tập. Đây là View mà 90% user của nền tảng sẽ tương tác hằng ngày.

**Thay đổi UX:**
- **Full-screen Sheet Music:** Sheet nhạc phóng to, giao diện Minimalist.
- **Floating Dock:** Một thanh điều khiển nổi tinh tế ở đáy màn hình. Bao gồm: Play/Pause, Tempo Slider (Kéo giãn tốc độ thời gian thực để tập chậm), Loop A/B (Lặp đoạn khó), Metronome (Máy đánh nhịp).
- **Pop-up Mixer:** Tính năng TrackList phức tạp của màn hình Editor được nén gọn lại thành 1 nút (Mixer/Stems icon) trên Dock. Bấm vào mới hiện ra bảng Volume nhỏ để tắt tiếng Piano mẫu (Solo) nhằm đánh backing track. Không hề có đồ thị sóng âm làm rối mắt. 

![Player Page UI Vision](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/tomplay_style_practice_ui_1773772485864.png)

---

### Kết luận
Toàn bộ luồng ứng dụng sẽ có tính kết dính mạch lạc:
`User lướt Discover` -> `Click bài Piano Nocturne` -> `Mở ra màn hình Player toàn màn hình để Tập Đàn (+ chỉnh Metronome/Tempo chậm lại)` -> `Thấy thích thì ấn Save vào My Dashboard (Setlist cá nhân)`.

Chỉ có **Creator** (Bạn) mới dùng nút "Create Project" trên Dashboard, upload File XML và Audio, sau đó vào `Editor View` để kéo thả Timemap và ấn Publish lên trang Discover.

---

## 5. Bản Thiết Kế Cận Cảnh (Macro Details)

Để bạn có cái nhìn rõ hơn về chất lượng UI/UX, tôi đã thiết kế thêm các bản "cận cảnh" (Close-up) các tiểu tiết cực kỳ quan trọng:

### 5.1. Cận cảnh Floating Control Bar & Mixer (Màn hình Player)
Giao diện thanh điều khiển nổi với thiết kế kính mờ (Glassmorphism). Khu vực Mixer được thiết kế dưới dạng **Popover Panel**, hiển thị 2 thanh gạt âm lượng (Piano vs Orchestra) kèm nút Mute (Đỏ) / Solo (Xanh) to rõ, cho phép người dùng tắt tiếng đàn mẫu cực nhanh gọn.
![Detailed Practice Control Bar](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/detailed_practice_control_bar_1773773291411.png)

### 5.2. Cận cảnh Music Cards (Màn hình Discover)
Thiết kế "Music Cards" giống Spotify: Có Cover Art (Ảnh bìa) độ phân giải cao thu hút ánh nhìn, các Tag báo hiệu Nhạc Cụ (Piano, Vocals) và đặc biệt là Badge Độ Khó (Beginner màu xanh, Advanced màu Đỏ).
![Detailed Discover Cards](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/detailed_discover_cards_1773773308586.png)

### 5.3. Cận cảnh Action Buttons (Màn hình Dashboard)
Bảng dữ liệu quản lý rõ ràng. Trọng tâm nằm ở cột Actions (Hành động): Nút `Play (Practice)` màu xanh nổi bật để vào chế độ tập đàn, và nút `Edit (Arranger)` phụ màu xám để vào chế độ chỉnh Timemap/Stems.
![Detailed Dashboard List](/Users/jefftrung/.gemini/antigravity/brain/31ee24ea-2f67-40a5-9504-c956a98d14bc/detailed_dashboard_list_1773773324852.png)
