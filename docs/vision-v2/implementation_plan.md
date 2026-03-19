# Thiết Kế Lại Sản Phẩm: Tập Trung Vào Tính Thực Tế & Chuyên Nghiệp

Chào bạn, sau khi phân tích các tài liệu thiết kế gốc, tôi hoàn toàn đồng ý rằng định hướng hiện tại có nguy cơ khiến sản phẩm có cảm giác giống một "chiếc đàn đồ chơi" (toy arranger keyboard) hơn là một công cụ âm nhạc chuyên nghiệp.

Dưới đây là các **pain points (vấn đề)** của thiết kế cũ và **Đề xuất thiết kế lại** để sản phẩm thực tế, có giá trị cao và người dùng thực sự muốn sử dụng hằng ngày.

---

## 1. Tại sao thiết kế cũ cho cảm giác "Đồ chơi"?

1. **Phụ thuộc quá nhiều vào MIDI & SoundFont (SpessaSynth)**: 
   - *Vấn đề:* Âm thanh MIDI/Soundfont nghe rất giả tạo, khô khan và thiếu cảm xúc so với nhạc thật. Dù có chia block, chia pattern (Intro, Main, Fill) mượt đến đâu, chất lượng âm thanh đầu ra vẫn giống nhạc game 8-bit hoặc đàn organ giá rẻ. Nghệ sĩ chuyên nghiệp không tập luyện hay biểu diễn với âm thanh này.
2. **Tham vọng làm Web DAW / Arranger Keyboard (Kiểu Genos 2)**:
   - *Vấn đề:* Tạo một Arranger Keyboard bằng cách ghép các pattern MIDI, hoặc yêu cầu user kéo thả cắt ghép MusicXML thành các Region trên web là một workflow rất cực nhọc và không tự nhiên. Người chuyên nghiệp sẽ dùng Logic Pro, Ableton, FL Studio để làm nhạc/beat, thay vì cố gắng arrange bằng các pattern cứng nhắc trên trình duyệt.
3. **Quá rắc rối cho mục đích "Chơi cùng" (Play-along)**:
   - *Vấn đề:* User chỉ muốn mở app lên, bật nhạc nền và lấy nhạc cụ ra chơi. Việc bắt họ phải thấy "Arrangement View", "Tracks", "Regions" làm che khuất đi giá trị cốt lõi là việc **tập luyện** (Practice) và **biểu diễn** (Live).

---

## 2. Tầm Nhìn Mới: "Pro Backing & Score" (Stems + MusicXML)

Hệ thống sẽ chuyển trục thành một **Công cụ hỗ trợ tập luyện và Khớp nhạc biểu diễn chuyên nghiệp (Stems & Sheet Practice/Live Tool)**.
Kết hợp sức mạnh của **bản thu Audio thật (Stems)** và khả năng hiển thị bản nhạc động của **MusicXML**.

### Chân dung User thực tế:
- **Người tập nhạc cụ (Guitar, Trống, Piano, Thanh nhạc):** Muốn có bản nhạc nền chất lượng cực cao (file thật do band đánh), tắt riêng tiếng Guitar/Trống đi để tự tập theo sheet nhạc (MusicXML).
- **Nhạc công đi show (Live):** Lên sân khấu mở iPad, kết nối âm thanh ra mixer (phát file audio backing chất lượng cao), màn hình thì tự động cuộn (auto-scroll) hiển thị tổng phổ/sheet nhạc (MusicXML) đồng bộ hoàn hảo với nhạc.

### Core Features (Sự kết hợp hoàn hảo giữa Audio và MusicXML):

#### 1. Audio Stems là Cốt lõi Âm thanh (Loại bỏ Arranger/Pattern MIDI)
- Bỏ hẳn tính năng "Pattern Builder", "Style Genos 2". 
- User/Admin sẽ upload các file **Audio thật** (WAV, MP3). Có thể là 1 file Backing track nguyên bản, hoặc **Multi-Stems** (Ví dụ: `Drums.wav`, `Bass.wav`, `Keys.wav`, `Vocals.wav`).
- Ứng dụng cung cấp một **Mixer chuyên nghiệp**: Giao diện đẹp, thao tác Mute/Solo mượt mà. User muốn đọc sheet Piano và tự đánh? Chỉ cần bấm Mute kênh Keys (Audio) và đánh đè lên tiếng của ban nhạc thật.

#### 2. MusicXML là Cốt lõi Hiển thị & Đồng bộ (Sheet/Score)
- Giữ lại và tập trung phát triển **chức năng upload/render MusicXML** (sử dụng thư viện `@music-i18n/verovio` mà bạn đã tích hợp). 
- **Lý do MusicXML là lựa chọn đúng đắn:** MusicXML là chuẩn công nghiệp, cho phép render sheet nhạc cực kỳ rõ nét ở mọi kích cỡ màn hình, tự động xuống dòng (reflow), và cho phép bôi đen (highlight) từng nốt/measure đang phát.
- **Tính năng Timemap:** Audio Tracks và MusicXML Sheet sẽ được đồng bộ với nhau qua một bản đồ thời gian (Timemap). Khi Audio chạy đến giây thứ N, Verovio sẽ highlight measure tương ứng trên MusicXML. Khi bấm vào 1 measure trên sheet, Audio sẽ tự động tua (seek) đến đúng đoạn đó.

#### 3. Chế Độ "Live Performance" Chuyên Nghiệp
- Chế độ màn hình tối (Dark Mode), hiển thị MusicXML với độ tương phản cao chống chói sáng sân khấu.
- Kích thước khuôn nhạc có thể thu phóng linh hoạt trên iPad.
- Các nút Transport (Play, Stop, Loop) thiết kế lớn, dễ thao tác. Mute/Solo hiển thị rõ ràng.

---

## 3. Kiến Trúc Giản Lược & Gọn Gàng

Chúng ta sẽ không cần lưu giữ cấu trúc DAW/Region phức tạp nữa.

```json
Project
├── metadata: tên bài, ca sĩ, tempo
├── type: "multi-stems" | "backing-track"
├── audioTracks: 
│   ├── [ { id: "drums", name: "Drums", fileUrl: "..." },
│   ├──   { id: "bass", name: "Bass", fileUrl: "..." } ]
├── notationData:
│   ├── type: "music-xml"
│   ├── fileUrl: "..." (Score file)
│   └── timemap: [ { timeMs: 0, measure: 1 }, { timeMs: 2500, measure: 2 } ]
```

### Các Giai Đoạn Triển Khai Thực Tế Mới (Roadmap Mới):

- **Giai đoạn 1: Stems Player & Mixer cơ bản.** 
  - Cho phép tạo Project, upload 1 đến N file audio (Drums, Bass, Vocal...). Giao diện cung cấp Mixer Mute/Solo. Chạy đồng bộ Play/Pause. (Loại bỏ các thành phần Arrangement View/Timeline không cần thiết).
- **Giai đoạn 2: MusicXML Upload & Visualizer.** 
  - User/Admin upload thêm 1 file MusicXML. 
  - Render file này bằng thư viện Verovio trên UI chính (thay thế cho Arrangement View cũ).
- **Giai đoạn 3: "The Magic Sync" (Đồng bộ Audio & MusicXML).** 
  - Thuật toán/Bảng điều khiển cho phép map `thời gian của Audio (Seconds/Ms)` khớp với `Số thứ tự Measure trong MusicXML` (Timemap).
  - Kết quả: Bấm Play audio -> nốt nhạc trên màn hình MusicXML đổi màu chạy theo tốc độ bài hát. Bấm vào khuông nhạc thứ 10 -> Audio playback lập tức tua đến đúng đoạn đó.
- **Giai đoạn 4: Live Mode & Discovery.** 
  - UI tối giản trên iPad cho dân đánh Live. 
  - Chia sẻ / Publish để tạo thành kho dữ liệu "Stems + Sheet nhạc" cho cộng đồng (Khám phá - Discover).

---

## Lời khuyên cho Data Model
Sự kết hợp giữa **Audio Stems chất lượng studio** và **MusicXML chuẩn mực** chính là "chén thánh" của các app tập luyện âm nhạc. Thay vì ép user nghe tiếng piano MIDI có sẵn trong MusicXML (thường rất lộ cộ, không cảm xúc), họ sẽ nhìn MusicXML để đánh theo tiếng trống/bass của một ban nhạc thực thụ thu âm trong Studio.

Định dạng MusicXML bạn chọn hoàn toàn chính xác vì nó chứa đầy đủ cấu trúc (measure, beat, note, chord symbol) cần thiết để chúng ta trích xuất dữ liệu, render sheet nhạc đẹp mắt bằng SVG (Verovio), và lập bản đồ đồng bộ (Timemap).

---

## 4. Kiến Trúc Hệ Thống (Mới) & Kế Hoạch Cải Tiến

Để trả lời cho câu hỏi về **Sử dụng lại hay Làm mới**, đề xuất của tôi là **Cải tiến (Refactor) trực tiếp trên project `backing-and-score` hiện tại**.

**Tại sao nên cải tiến (Refactor) thay vì làm lại từ đầu?**
- Dự án `backing-and-score` đã thiết lập sẵn bộ khung **Next.js App Router** siêu chuẩn.
- Đã cài đặt hoàn tất **Appwrite Client/Server SDK** (Đăng nhập, Đăng ký, Quản lý Session, Routing bảo mật).
- Đã có sẵn giao diện **Dashboard (My Projects)** và hệ thống Upload File lên Appwrite Storage.
-> Chúng ta chỉ cần đục bỏ phần lõi Editor (ArrangementView, MixerView cũ) và thay bằng UI/Logic mới tiết kiệm được rất nhiều thời gian setup.

### Cấu Trúc Architecture Mới:
1. **Frontend Core (Next.js 15+ & React 19):**
   - Vẫn sử dụng bộ khung UI Radix/Tailwind cũ.
   - Component `MixerConsole` (Mới) để điều khiển Mute/Solo các file Audio.
   - Component `MusicXMLVisualizer` (Mới) sử dụng thư viện Verovio.

2. **Bài Toán Verovio (Thay thế `@music-i18n/verovio`):**
   - Đúng như bạn nhận xét, thư viện bọc sẵn `@music-i18n/verovio` có thể gây ra nhiều lỗi do không cập nhật hoặc xung đột React.
   - Qua khảo sát project `verovio-editor` của bạn, họ sử dụng mô hình **Web Worker Proxy (`verovio-toolkit-wasm.js`) trực tiếp**.
   - **Giải pháp:** Chúng ta sẽ clone mô hình Web Worker từ `verovio-editor` mang sang `backing-and-score`. Thay vì chạy Verovio trực tiếp trên luồng chính (Main Thread) gây giật UI, ta đưa Verovio vào Background Worker, load file MusicXML siêu mượt mà không bị lỗi thư viện trung gian.

3. **Backend & Lưu Trữ (Giữ nguyên Appwrite):**
   - **Database (`projects` collection):** Lưu `DAWPayload` mới (đã rút gọn thành cấu trúc Audio Stems + Sync Map ở phần 2).
   - **Storage (`uploads` bucket):** Lưu các file MusicXML và các file Audio WAV/MP3 Stems không giới hạn. Tải xuống bằng Chunk để Web Audio API phát mượt.

4. **Playback Engine (Web Audio API):**
   - Bỏ SpessaSynth (vì không còn dùng MIDI làm nguồn âm thanh chính).
   - Tự viết một `AudioManager` sử dụng Web Audio API chuẩn HTML5 để Sync (Play/Pause/Seek) 4-5 file Audio cùng một lúc, đảm bảo các file không bị lệch nhịp.
