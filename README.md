# Nền Tảng Thờ Phượng Trực Tuyến Đa Hội Thánh (Multi-Tenant Sanctuary Platform)
### SaaS Cho Các Hội Thánh Tin Lành Việt Nam

Một giải pháp phòng thờ phượng trực tuyến chuyên biệt đa Hội Thánh (Multi-Tenant) dành cho các Hội Thánh Tin Lành tại Việt Nam, xây dựng trên nền tảng **Next.js 14 (App Router)**, **Tailwind CSS**, **Lucide React**, **Hls.js**, **Mongoose** và **MongoDB Atlas**.

---

## 🕊️ Triết Lý Thiết Kế: "Reverent & Humanistic Minimalist"

Dự án tuyệt đối tránh các yếu tố rập khuôn thị giác phổ biến của AI ("AI-generated look"):
- ❌ **Không** dải màu neon rực rỡ (tím/cyan/indigo glow gây xao nhãng).
- ❌ **Không** kính mờ phản quang dày đặc (glassmorphism/frost blur quá đà).
- ❌ **Không** thẻ trôi nổi đa tầng hỗn loạn hoặc nút bấm hình viên thuốc dẹt (pill buttons) khắp nơi.
- ❌ **Không** icon bay lượn spam kiểu mạng xã hội giật gân.

### ✅ Những Tiêu Chuẩn Thay Thế Được Ứng Dụng:
1. **Không Khí Thánh Đường (Sanctuary Atmosphere):**
   - **Tông nền chính:** Đen than ấm trầm (*Deep warm charcoal* `#0f1115` và `#14171d`), tạo chiều sâu tĩnh lặng, êm dịu cho mắt khi xem liên tục 2–3 tiếng.
   - **Màu nhấn phụng vụ:** Vàng đồng cổ điển (*Subtle warm bronze/gold* `#c5a059`), màu rượu nho tiệc thánh (*Muted sacrament burgundy* `#722f37`), và ánh nến cầu nguyện (*Warm candle amber* `#e09f3e`).
   - **Đường nét kiến trúc:** Viền sắc nét, thanh thoát (`border-white/[0.08]` hoặc `border-gold-400/30`), góc bo vừa phải (`rounded-md` / `rounded-lg`).
2. **Khả Năng Tiếp Cận Cho Người Cao Tuổi (Elderly Accessibility):**
   - Nút chuyển đổi kích cỡ chữ chuyên dụng **Chuẩn / Lớn (+15%) / Rất Lớn (+25%)** ngay trên thanh tiêu đề, giúp quý cụ và các tín hữu lớn tuổi đọc Lời Chúa và chat rõ ràng.
   - Tương phản văn bản cao (`#f3f4f6` trên nền than ấm), phân định rõ ràng giữa lời Kinh Thánh và chú thích.
3. **Phông Chữ Thần Học & Kinh Thánh:**
   - Hỗ trợ đầy đủ dấu thanh tiếng Việt qua Google Fonts: `Lora` (Serif kinh thánh trang trọng) và `Plus Jakarta Sans` (Sans-serif giao diện hiện đại, rõ nét).

---

## 🏛️ Cấu Trúc Nền Tảng Đa Hội Thánh (Multi-Tenant Architecture)

### 1. Cổng Kết Nối & Danh Sách Các Hội Thánh (`/`)
- Màn hình trang chủ liệt kê tất cả các Hội Thánh đang hoạt động trên hệ thống.
- Thanh tìm kiếm thời gian thực theo tên Hội Thánh, địa phương, mã định danh slug.
- Bộ lọc theo hệ phái: *Tất Cả, HTTL Việt Nam, Báp-tít, Trưởng Lão, Liên Hữu Cơ Đốc...*
- Thẻ thông tin từng Hội Thánh hiển thị: Tên, hệ phái, địa chỉ, lịch phát sóng và huy hiệu **TRỰC TIẾP**.
- Nút bấm **"Vào Phòng Thờ Phượng"** dẫn trực tiếp đến không gian riêng biệt của Hội Thánh đó (`/[churchSlug]`).
- Nút **"Đăng Ký Hội Thánh Mới"** cho phép Hội Thánh mới ngay trên giao diện.

### 2. Phòng Thờ Phượng Riêng Biệt (`/[churchSlug]`)
- Tự động truy vấn dữ liệu Hội Thánh từ MongoDB Atlas theo `params.churchSlug`.
- Tự động hiển thị trang thông báo 404 trang nghiêm nếu không tìm thấy Hội Thánh.
- **Trình phát HLS động:** Luồng phát cấu trúc theo `http://169.58.235.90:8080/live/${church.streamKey}.m3u8` (kèm cơ chế tự động chuyển đổi sang video kiểm thử nếu luồng trực tiếp chưa lên sóng).
- **Dâng Hiến VietQR Động:** Tự động tạo mã VietQR chuẩn Napas với số tài khoản, tên chủ tài khoản và cú pháp chuyển khoản tương ứng với Hội Thánh đó.
- **Cầu Nguyện Kín:** Mọi nan đề được gửi kèm `churchSlug` để lưu riêng cho Ban Mục Vụ của Hội Thánh quản nhiệm.
- **Trò Chuyện Cộng Đồng:** Dòng tin nhắn và lượt hiệp ý Amen được phân tách độc lập theo từng Hội Thánh.

---

## 🍃 Mô Hình Dữ Liệu MongoDB & Mongoose

### 1. Model Hội Thánh ([`src/models/Church.ts`](file:///D:/church/src/models/Church.ts))
- `name`: Tên Hội Thánh (e.g. *"Hội Thánh Tin Lành Lời Ban Sự Sống"*)
- `slug`: Mã định danh duy nhất (e.g. *"loibansusong"*, *"andien"*)
- `denomination`: Hệ phái (e.g. *"Hội Thánh Tin Lành Việt Nam"*)
- `address`: Địa chỉ cơ sở nhà thờ
- `streamKey`: Khóa luồng phát trực tiếp (e.g. *"lbs-sunday"*)
- `themeConfig`: Màu nhấn và logo tùy biến
- `bankingConfig`: Ngân hàng, số tài khoản, tên chủ tài khoản dùng cho VietQR
- `liveSchedule`: Lịch chương trình thờ phượng
- `isActive`: Trạng thái hoạt động

### 2. Các Model Nghiệp Vụ Đi Kèm:
- [`src/models/PrayerRequest.ts`](file:///D:/church/src/models/PrayerRequest.ts): Lưu nan đề cầu nguyện kín (có `churchSlug`).
- [`src/models/ChatMessage.ts`](file:///D:/church/src/models/ChatMessage.ts): Lưu tin nhắn trò chuyện (có `churchSlug`).
- [`src/models/SalvationDecision.ts`](file:///D:/church/src/models/SalvationDecision.ts): Lưu quyết định tin nhận Chúa (có `churchSlug`).

---

## 📡 API Endpoints

- `GET /api/churches`: Lấy danh sách các Hội Thánh (hỗ trợ `?search=` và `?denomination=`).
- `POST /api/churches`: Đăng ký Hội Thánh mới.
- `GET, POST /api/seed`: Khởi tạo dữ liệu mẫu 2 Hội Thánh ban đầu nếu database trống.
- `GET, POST /api/chat?churchSlug=...`: Trò chuyện cộng đồng theo Hội Thánh.
- `GET, POST /api/prayer-requests`: Gửi và nhận nan đề cầu thay theo Hội Thánh.
- `GET, POST /api/salvation-decisions`: Tiếp nhận thân hữu tin nhận Chúa theo Hội Thánh.

---

## 🚀 Khởi Chạy Ứng Dụng

```powershell
# Khởi chạy server phát triển
npm run dev

# Mở trình duyệt truy cập:
http://localhost:3001
```

### Các Đường Dẫn Trực Tiếp Đã Có Sẵn:
- 🏛️ Cổng danh mục Hội Thánh: `http://localhost:3001/`
- 🕊️ Hội Thánh Lời Ban Sự Sống: `http://localhost:3001/loibansusong`
- 🕊️ Hội Thánh Ân Điển: `http://localhost:3001/andien`
- 🕊️ Hội Thánh Hà Nội: `http://localhost:3001/hanoi`
- ⚠️ Trang kiểm tra 404: `http://localhost:3001/chua-co-hoi-thanh`
