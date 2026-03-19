# Backing & Score - Product Overview
*Tài liệu giới thiệu sản phẩm dành cho Nhà đầu tư*

## 1. Tầm nhìn & Sứ mệnh
**Backing & Score** là một nền tảng Web-based đột phá kết hợp giữa Trình soạn thảo âm nhạc (DAW - Digital Audio Workstation) và Trình đọc bản nhạc (Sheet Music Reader). 

Sứ mệnh của chúng tôi là dân chủ hoá việc học tập, luyện tập và sản xuất âm nhạc bằng cách cung cấp một công cụ mạnh mẽ, trực quan ngay trên trình duyệt web mà không cần cài đặt phần mềm phức tạp. Sản phẩm hướng tới việc thu hẹp khoảng cách giữa lý thuyết âm nhạc (Sheet Music/MusicXML) và thực hành âm thanh (Audio/MIDI).

## 2. Vấn đề giải quyết (Pain Points)
- **Sự phân mảnh công cụ:** Nhạc sĩ và ca sĩ thường phải dùng một phần mềm để xem bản nhạc (như MuseScore, Sibelius) và một phần mềm khác để bật nhạc cụ đệm (backing track). Việc đồng bộ giữa hai nền tảng mất nhiều thời gian.
- **Rào cản kỹ thuật:** Các phần mềm DAW truyền thống (Logic Pro, Ableton) quá phức tạp và nặng nề đối với những người mới học hoặc ca sĩ chỉ cần luyện thanh.
- **Tiếp cận khó khăn:** Thiếu một nền tảng cho phép giáo viên âm nhạc dễ dàng chia sẻ dự án bao gồm cả bản nhạc và nhạc đệm cho học sinh luyện tập trực tuyến.

## 3. Giải pháp & Tính năng cốt lõi (Core Features)

### 3.1. Trình đọc bản nhạc tương tác (Interactive Sheet Music)
- Tích hợp công nghệ lõi **Verovio** (chuẩn công nghiệp) giúp render các file `MusicXML` phức tạp với độ chính xác tuyệt đối.
- **Real-time Playhead:** Thanh nhịp (Ruler) chạy đồng bộ với bản nhạc, bôi sáng (highlight) các nốt nhạc theo thời gian thực giúp người dùng dễ dàng theo dõi.
- **Responsive Design:** Bản nhạc tự động chia dòng và co giãn mượt mà tuỳ thuộc vào kích thước màn hình thiết bị (từ PC đến Mobile).

### 3.2. Web-based DAW & Audio Multitrack
- Hỗ trợ tải lên và mix nhiều track Audio/Stems cùng lúc ngay trên trình duyệt.
- Các tính năng tiêu chuẩn của Studio chuyên nghiệp: Mute, Solo, Volume Control (Mixer), và Waveform trực quan.
- **Unified Engine:** Phát thanh đồng thời nhiều nguồn âm thanh mượt mà nhờ kiến trúc Web Audio API hiện đại.

### 3.3. Tích hợp MIDI Synth & Piano Roll Visualizer
- **Tự động chuyển đổi:** Tự độ bóc tách dữ liệu tử Sheet Music (MusicXML) để tạo ra các track MIDI ảo (Score Synth) phát bằng SoundFont chất lượng cao. Giúp người dùng có thể nghe bản nhạc ngay cả khi chưa thu âm Audio.
- **Piano Roll:** Trình diễn các nốt nhạc MIDI dưới định dạng Piano Roll chuyên nghiệp, trực quan với màu sắc sinh động, timeline đồng bộ tuyệt đối với Audio.

### 3.4. Bộ công cụ luyện tập (Practice Tools)
- **Time Stretching & Pitch Shifting:** Thay đổi tốc độ bài hát (Speed) hoặc Tông nhạc (Pitch) theo ý muốn trực tiếp trên trình duyệt để phù hợp với giọng hát của từng người.
- **A-B Looping:** Dễ dàng khoanh vùng một đoạn nhạc khó để lặp đi lặp lại.
- **Metronome thông minh:** Tích hợp bộ gõ nhịp (Click track) tự động đồng bộ BPM với bản nhạc.

## 4. Công nghệ lõi (Technical Highlights)
Backing & Score tự hào sở hữu một nền tảng kiến trúc kỹ thuật tiên tiến, đảm bảo trải nghiệm người dùng siêu mượt mà:
- **Web Workers:** Đẩy toàn bộ các tác vụ tính toán nặng (như render Sheet Music, decode Audio) xuống Background Thread, giúp UI luôn đạt mức 60 FPS không giật lag.
- **Hardware-Accelerated Canvas:** Tối ưu hoá hiển thị hiển thị Waveform và Piano Roll cực rộng (> 100,000 pixels) mà không ngốn tài nguyên RAM, vượt qua các giới hạn của trình duyệt thông thường.
- **Next.js & React:** Xây dựng trên framework React hiện đại, tối ưu SEO, hỗ trợ Server-side Rendering và load trang chỉ trong tích tắc.

## 5. Chân dung Khách hàng mục tiêu (Target Audience)
1. **Ca sĩ & Người học thanh nhạc:** Cần một công cụ để nghe nhạc đệm (Backing) và nhìn khuông nhạc cùng lúc, có thể tăng giảm Tone cho hợp giọng.
2. **Nhạc công (Guitarist, Pianist...):** Luyện tập với Metronome, Loop các đoạn khó, kết hợp với Backing Track.
3. **Giáo viên & Học viện âm nhạc:** Kênh phân phối bài giảng số hoá. Học sinh chỉ cần mở Link trên Web là có sẵn Sheet nhạc và file âm thanh mẫu để tập tại nhà.

## 6. Mô hình kinh doanh (Business Model)

Backing & Score áp dụng mô hình **Freemium** linh hoạt với đa dạng nguồn doanh thu từ cả khách hàng cá nhân (B2C) và doanh nghiệp/tổ chức (B2B):

### 6.1. Người dùng cá nhân (B2C)
- **Basic (Miễn phí):** Giới hạn số lượng bài hát, hỗ trợ tối đa 2 Audio Tracks/dự án, tính năng Metronome và Playback cơ bản. Phù hợp cho người mới bắt đầu.
- **Pro Subscription (Gói tháng / năm):** Mở khoá toàn bộ tính năng: Không giới hạn Audio Tracks, tải xuống file tách Stem bằng AI, tính năng Pitch Shifting/Time Stretching chuyên sâu, không quảng cáo và bộ lưu trữ đám mây cao cấp.
- **Chợ tài nguyên (Marketplace):** Nền tảng cho phép người dùng mua bán Sheet nhạc dạng PDF và Backing track bản quyền trực tiếp trên hệ thống (Công ty thu hoa hồng giao dịch).

### 6.2. Giáo dục & Chuyên gia (B2B)
- **Education Plan:** Gói dành riêng cho các Nhạc viện, Trung tâm âm nhạc và Giáo viên thanh nhạc. Cấp quyền tạo Lớp học, giao bài tập qua Link, theo dõi tiến độ luyện tập của học sinh trực tiếp trên hệ thống.
- **API / White-label:** Cung cấp lõi render Sheet Music & DAW dạng API tích hợp cho các nền tảng giáo dục âm nhạc bên thứ 3 (Edtech music platforms).

## 7. Lộ trình phát triển tương lai (Roadmap)
- **Giai đoạn 1 (Hiện tại):** Hoàn thiện Core Engine Audio/MIDI/Sheet Music playback.
- **Giai đoạn 2:** Bổ sung tính năng ghi âm (Recording) trực tiếp qua Web Microphone, cho phép nghệ sĩ thu âm bản nháp ngay trên bản nhạc đệm.
- **Giai đoạn 3:** Xây dựng tính năng chia sẻ (Collaboration) real-time, comment vào từng ô nhịp nhạc.
- **Giai đoạn 4:** Ứng dụng AI phân tích giọng hát, đối chiếu cao độ của người hát với Sheet Music gốc để đưa ra điểm số/phản hồi (Vocal Scoring).

---

*Backing & Score không chỉ là một ứng dụng web, mà là một studio âm nhạc bỏ túi, mang năng lực sản xuất và luyện tập âm nhạc chuyên nghiệp đến tay bất kỳ ai có kết nối Internet.*
