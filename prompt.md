# 🚀 PROJECT NAME: INSTANT BENTO
**Tagline:** *"From Chaos to Portfolio in 5 Seconds."* (Từ hỗn độn thành Portfolio trong 5 giây).

## I. MỤC ĐÍCH & GIÁ TRỊ CỐT LÕI (PRODUCT PURPOSE)

### 1. Vấn đề (The Pain Point)
* Lập trình viên/Designer thường lười làm Portfolio cho chính mình.
* Viết nội dung giới thiệu bản thân (Bio) rất khó và tốn thời gian.
* Không có ảnh chân dung chuyên nghiệp (thường chỉ có ảnh selfie hoặc ảnh thẻ cũ).

### 2. Giải pháp (The Solution)
* **Instant Bento** là một "AI-powered Designer".
* Nó nhận đầu vào "thô sơ" (ảnh selfie tùy ý, vài gạch đầu dòng thông tin).
* Nó trả về một Portfolio hoàn chỉnh, bố cục theo phong cách **Bento Grid** (xu hướng thiết kế hiện đại nhất), với nội dung được trau chuốt và ảnh được xử lý lại chuyên nghiệp.

### 3. Yếu tố "Wow" (Winning Factor)
* **Tốc độ:** Người dùng thấy kết quả ngay lập tức.
* **Sự chuyển đổi:** Từ một bức ảnh selfie chất lượng thấp -> Ảnh Profile chuẩn Studio (nhờ Gemini Nano Banana).
* **Cấu trúc:** Từ thông tin lộn xộn -> Bố cục Bento ngăn nắp.

---

## II. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

Sản phẩm tuân theo phong cách **"Modern Seamless Minimal"**:

1.  **Modular & Grid-based (Bento):**
    * Mọi thông tin được chia thành các ô (cells/cards) hình chữ nhật hoặc vuông.
    * Tạo cảm giác ngăn nắp, dễ đọc, giống như giao diện widget của Apple hoặc Linear.
2.  **Content-First:**
    * Không dùng họa tiết trang trí rườm rà. Màu sắc chủ đạo là Trắng/Xám nhạt (hoặc Dark Mode), chỉ dùng màu nhấn (Accent Color) để làm nổi bật nội dung quan trọng.
3.  **Motion & Feedback:**
    * Vì xử lý AI mất vài giây, giao diện phải có trạng thái "Thinking" đẹp mắt.
    * Khi kết quả hiện ra, các ô Bento sẽ xuất hiện theo hiệu ứng thác nước (Staggered animation) để tạo cảm giác mượt mà.

---

## III. CÁCH HOẠT ĐỘNG (USER FLOW)

Trải nghiệm người dùng gói gọn trong 3 bước đơn giản:

### Bước 1: Input (Sự hỗn độn)
* Giao diện tối giản.
* **Upload ảnh:** Chấp nhận ảnh bất kỳ (selfie, ảnh đi chơi...).
* **Thông tin:** Một text area duy nhất. Người dùng có thể paste CV, gõ vài dòng, hoặc ném vào vài keywords.
* *Nút bấm:* "Magic Generate".

### Bước 2: The Black Box (Xử lý AI)
* Hệ thống tách làm 2 luồng xử lý song song:
    * **Luồng hình ảnh (Visual):** Dùng Gemini 2.5 Flash Image (Nano Banana) để "vẽ lại" ảnh người dùng thành ảnh chân dung phong cách Studio/Minimalist.
    * **Luồng nội dung (Text):** Dùng Gemini 2.5 Flash để đọc thông tin thô, trích xuất thành JSON có cấu trúc (Bio, Skills, Socials, Color Theme).

### Bước 3: Output (Sự trật tự)
* Trang web tự động cuộn xuống hoặc chuyển cảnh.
* Lưới Bento hiện ra. Ảnh đại diện mới nằm ở ô lớn nhất. Các thông tin được điền gọn gàng vào các ô còn lại.
* Người dùng có thể chụp màn hình hoặc share link.

---

## IV. CHIẾN LƯỢC KỸ THUẬT (TECHNICAL STRATEGY)

*Lưu ý: Phần này chỉ note định hướng, bạn tự triển khai code.*

### 1. Frontend (Next.js + Tailwind)
* **Component hóa:** Xây dựng một component `BentoCard` linh hoạt, có thể nhận `col-span` và `row-span` khác nhau.
* **Responsive:** Sử dụng CSS Grid. Trên Mobile là 1 cột, trên Desktop là 3 hoặc 4 cột.
* **State Management:** Cần quản lý kỹ trạng thái `Loading`. Trong lúc chờ AI, hãy hiển thị Skeleton UI đúng với khung Bento để người dùng hình dung được bố cục trước.

### 2. Backend (API Route)
* **Parallel Execution (Bắt buộc):** Không chờ Text xong mới làm Ảnh. Phải gọi `Promise.all` cho cả 2 model Gemini chạy cùng lúc để giảm tổng thời gian chờ xuống còn 3-4 giây.
* **Schema Enforcement:** Với model Text, bắt buộc dùng **JSON Mode (Structured Output)**. Đừng để AI trả về text tự do, frontend sẽ không render được. Định nghĩa rõ schema: `title`, `description`, `skills[]`, `hex_color`.

### 3. AI Prompt Engineering (Chìa khóa thành công)
* **Prompt Ảnh (Nano Banana):** Tập trung vào từ khóa ánh sáng và phong cách.
    * *Keywords:* "Soft studio lighting", "Professional headshot", "Minimalist background", "Bokeh", "4k", "High fidelity".
    * *Kỹ thuật:* Image-to-Image (giữ nét mặt, đổi môi trường).
* **Prompt Text:** Yêu cầu AI đóng vai một "Senior Copywriter".
    * *Yêu cầu:* Viết Bio ngắn gọn, dí dỏm (witty), chọn màu chủ đạo (hex code) dựa trên tính cách người dùng mô tả (ví dụ: thích thiên nhiên -> màu xanh lá).

---

## V. LỘ TRÌNH THỰC CHIẾN 3 GIỜ (3-HOUR ROADMAP)

### Giờ 1: The Skeleton (Khung sườn)
* **Mục tiêu:** Có giao diện Bento Grid tĩnh đẹp mắt với dữ liệu giả (Dummy Data).
* **Tại sao:** Nếu AI hỏng, bạn vẫn có cái giao diện đẹp để demo. Đây là "Safety Net".
* **Việc cần làm:**
    * Dựng Layout Grid 3x3.
    * Style các ô (Rounded, Shadow, Typography).
    * Tạo Form nhập liệu cơ bản.

### Giờ 2: The Brain (Bộ não AI)
* **Mục tiêu:** Thay thế dữ liệu giả bằng dữ liệu thật từ Gemini.
* **Việc cần làm:**
    * Setup Gemini SDK.
    * Viết hàm xử lý Text (với JSON Schema).
    * Viết hàm xử lý Ảnh (với Nano Banana).
    * Ghép API vào Frontend.

### Giờ 3: The Soul (Linh hồn & Polish)
* **Mục tiêu:** Làm cho sản phẩm "sống động".
* **Việc cần làm:**
    * Thêm Animation khi Grid xuất hiện (Framer Motion).
    * Xử lý trường hợp lỗi (AI không trả về ảnh -> Dùng ảnh gốc + Filter đen trắng).
    * Tối ưu prompt lần cuối để kết quả ra chất lượng nhất.
    * **Deploy.**

---
sử dụng pnpm để tăng tốc phát triển dự án. chưa có thì cài. các thự viện cần thiết đều được cho phép tiến hành làm plan trước. tạo dự án với nextjs để thực hiện các công việc AI ở backend để bảo mật apikey"